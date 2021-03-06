import { FunctionNameDefinition } from "@typescript-eslint/scope-manager";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { isFunctionDeclaration, isFunctionExpression } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import {
  makeConstantTerminalNode,
  makeNodeTerminalNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";
import { getReturnStatements } from "../utils/get-return-statements";

export function visitFunctionName(
  ctx: HandlingContext,
  functionName: FunctionNameDefinition
): TraceNode[] {
  if (
    !isFunctionDeclaration(functionName.node) &&
    !isFunctionExpression(functionName.node)
  ) {
    return [
      makeUnresolvedTerminalNode({
        reason: `Unable to visit function`,
        connection: ctx.connection,
        astNodes: ctx.connection.astNodes,
        meta: ctx.meta,
      }),
    ];
  }

  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, functionName.node],
    },
    meta: {
      callCount: ctx.meta.callCount - 1,
    },
  });

  if (ctx.meta.callCount <= 0) {
    return [
      makeNodeTerminalNode({
        astNode: functionName.node,
        connection: nextCtx.connection,
        astNodes: nextCtx.connection.astNodes,
        meta: nextCtx.meta,
      }),
    ];
  }

  const functionScope = getInnermostScope(nextCtx.rootScope, functionName.node);

  const newNodes = getReturnStatements(functionName.node.body.body).flatMap(
    (returnStatement) =>
      handleNode(
        deepMerge(nextCtx, {
          connection: {
            astNodes: [...nextCtx.connection.astNodes, returnStatement],
          },
          scope: getInnermostScope(functionScope, returnStatement),
        }),
        returnStatement.argument
      )
  );

  if (newNodes.length > 0) {
    return newNodes;
  }

  return [
    // If we encounter a function that returns void, the value is theoretically
    // nothing.
    makeConstantTerminalNode({
      value: "",
      connection: nextCtx.connection,
      astNodes: nextCtx.connection.astNodes,
      meta: nextCtx.meta,
    }),
  ];
}
