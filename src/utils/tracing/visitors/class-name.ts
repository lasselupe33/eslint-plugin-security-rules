import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import {
  isAssignmentExpression,
  isClassDeclaration,
  isExpressionStatement,
  isIdentifier,
  isMemberExpression,
  isMethodDefinition,
  isPropertyDefinition,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import {
  isConstantTerminalNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";

export function visitClassName(
  ctx: HandlingContext,
  className: Scope.Definition
): TraceNode[] {
  if (!isClassDeclaration(className.node) || !className.node.id) {
    return [
      makeUnresolvedTerminalNode({
        reason: `Unable to visit class`,
        connection: ctx.connection,
        astNodes: ctx.connection.astNodes,
        meta: ctx.meta,
      }),
    ];
  }

  const nextCtx = deepMerge(ctx, {
    scope: getInnermostScope(ctx.rootScope, className.node),
  });

  const targetName = ctx.meta.memberPath.pop();
  const target = className.node.body.body.find(
    (it): it is TSESTree.PropertyDefinition | TSESTree.MethodDefinition =>
      (isPropertyDefinition(it) || isMethodDefinition(it)) &&
      isIdentifier(it.key) &&
      it.key.name === targetName
  );

  const traceNodes: TraceNode[] = handleNode(nextCtx, target?.value);

  // For method definitions we simply need to trace its implementation
  if (isMethodDefinition(target)) {
    return traceNodes;
  }

  const constructor = className.node.body.body.find(
    (it): it is TSESTree.MethodDefinition =>
      isMethodDefinition(it) &&
      isIdentifier(it.key) &&
      it.key.name === "constructor"
  );

  for (const statement of constructor?.value.body?.body ?? []) {
    if (
      isExpressionStatement(statement) &&
      isAssignmentExpression(statement.expression) &&
      isMemberExpression(statement.expression.left)
    ) {
      const propertyName = handleNode(
        deepMerge(nextCtx, { meta: { forceIdentifierLiteral: true } }),
        statement.expression.left
      )[0];

      if (
        isConstantTerminalNode(propertyName) &&
        propertyName.value === targetName
      ) {
        traceNodes.push(...handleNode(nextCtx, statement.expression.right));
      }
    }
  }

  // In case the target property does not exist on the current class, then
  // traverse to the superClass in hopes that the property/method may exist
  // there.
  if (!traceNodes.length && targetName) {
    nextCtx.meta.memberPath.push(targetName);
    return handleNode(nextCtx, className.node.superClass);
  }

  return traceNodes;
}
