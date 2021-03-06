import { Scope } from "@typescript-eslint/scope-manager";
import { TSESTree } from "@typescript-eslint/utils";

import {
  isClassDeclaration,
  isIdentifier,
  isPropertyDefinition,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import {
  makeConstantTerminalNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleThisExpression(
  ctx: HandlingContext,
  thisExpression: TSESTree.ThisExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, thisExpression],
    },
  });

  const targetName = ctx.meta.memberPath.pop();
  const classDeclaration = getNearestClassDeclaration(ctx);

  if (!targetName || !classDeclaration) {
    return [
      makeUnresolvedTerminalNode({
        reason:
          "Unable to resolve target on thisExpression ('this' is supported only inside classes)",
        astNodes: nextCtx.connection.astNodes,
        connection: nextCtx.connection,
        meta: nextCtx.meta,
      }),
    ];
  }

  const targetProperty = classDeclaration.body.body.find(
    (it): it is TSESTree.PropertyDefinition =>
      isPropertyDefinition(it) &&
      isIdentifier(it.key) &&
      it.key.name === targetName
  );

  if (!targetProperty || !isIdentifier(targetProperty.key)) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to resolve targetProperty",
        astNodes: nextCtx.connection.astNodes,
        connection: nextCtx.connection,
        meta: nextCtx.meta,
      }),
    ];
  }

  if (!targetProperty.value || ctx.meta.forceIdentifierLiteral) {
    const value = ctx.meta.forceIdentifierLiteral
      ? targetProperty.key.name
      : "undefined";

    return [
      makeConstantTerminalNode({
        value,
        connection: nextCtx.connection,
        astNodes: nextCtx.connection.astNodes,
        meta: nextCtx.meta,
      }),
    ];
  }

  return handleNode(nextCtx, targetProperty?.value);
}

function getNearestClassDeclaration(
  ctx: HandlingContext
): TSESTree.ClassDeclaration | undefined {
  let currentScope: Scope | null = ctx.scope;

  while (currentScope !== null) {
    if (isClassDeclaration(currentScope.block)) {
      return currentScope.block;
    }

    currentScope = currentScope.upper;
  }
}
