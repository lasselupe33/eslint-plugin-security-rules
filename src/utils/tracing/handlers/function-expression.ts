import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { makeNodeTerminalNode, TraceNode } from "../types/nodes";
import { getReturnStatements } from "../utils/get-return-statements";

import { handleNode } from "./_handle-node";

export function handleFunctionExpression(
  ctx: HandlingContext,
  functionExpression: TSESTree.FunctionExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, functionExpression],
    },
  });

  if (ctx.meta.callCount <= 0) {
    return [
      makeNodeTerminalNode({
        astNode: functionExpression,
        connection: nextCtx.connection,
        astNodes: nextCtx.connection.astNodes,
        meta: nextCtx.meta,
      }),
    ];
  }

  // In case we encounter an anonymous function we cannot create proper mappings
  // between arguments and parameters (given the current implementation), in
  // this case we do our best efforts to trace the function implementation.
  if (!functionExpression.id) {
    const functionScope = getInnermostScope(ctx.rootScope, functionExpression);

    return getReturnStatements(functionExpression.body.body).flatMap((it) =>
      handleNode(
        deepMerge(nextCtx, {
          connection: { astNodes: [...nextCtx.connection.astNodes, it] },
          scope: getInnermostScope(functionScope, it),
        }),
        it.argument
      )
    );
  }

  return handleNode(nextCtx, functionExpression.id);
}
