import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleAwaitExpression(
  ctx: HandlingContext,
  awaitExpression: TSESTree.AwaitExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, awaitExpression],
    },
  });

  return handleNode(nextCtx, awaitExpression.argument);
}
