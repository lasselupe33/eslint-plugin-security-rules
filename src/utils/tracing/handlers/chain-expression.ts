import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleChainExpression(
  ctx: HandlingContext,
  chainExpression: TSESTree.ChainExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, chainExpression],
    },
  });

  return handleNode(nextCtx, chainExpression.expression);
}
