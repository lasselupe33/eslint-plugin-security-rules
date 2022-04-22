import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { isBlockStatement, isReturnStatement } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { makeNodeTerminalNode, TraceNode } from "../types/nodes";
import { getReturnStatements } from "../utils/get-return-statements";

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
    : getReturnStatements(arrowFunctionExpression.body.body);

  return returnStatements.flatMap((returnStatement) =>
    handleNode(
      deepMerge(nextCtx, {
        connection: {
          astNodes: [...nextCtx.connection.astNodes, returnStatement],
        },
        scope: getInnermostScope(ctx.rootScope, returnStatement),
      }),
      isReturnStatement(returnStatement)
        ? returnStatement.argument
        : returnStatement
    )
  );
}
