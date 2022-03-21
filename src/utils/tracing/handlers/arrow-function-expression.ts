import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { isBlockStatement, isReturnStatement } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { makeNodeTerminalNode, TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleArrowFunctionExpression(
  ctx: HandlingContext,
  arrowFunctionExpression: TSESTree.ArrowFunctionExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, arrowFunctionExpression],
    },
  });

  if (ctx.meta.callCount <= 0) {
    return [
      makeNodeTerminalNode({
        astNode: arrowFunctionExpression,
        connection: nextCtx.connection,
        astNodes: nextCtx.connection.astNodes,
        meta: nextCtx.meta,
      }),
    ];
  }

  const returnStatements = !isBlockStatement(arrowFunctionExpression.body)
    ? [arrowFunctionExpression.body]
    : arrowFunctionExpression.body.body.filter(
        (node): node is TSESTree.ReturnStatement => isReturnStatement(node)
      );

  return returnStatements.flatMap((returnStatement) =>
    handleNode(
      deepMerge(nextCtx, {
        scope: getInnermostScope(ctx.rootScope, returnStatement),
      }),
      isReturnStatement(returnStatement)
        ? returnStatement.argument
        : returnStatement
    )
  );
}
