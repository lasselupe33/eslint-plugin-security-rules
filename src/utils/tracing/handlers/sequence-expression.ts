import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleSequenceExpression(
  ctx: HandlingContext,
  sequenceExpression: TSESTree.SequenceExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, sequenceExpression],
    },
  });

  // A sequence always returns the last expression
  const finalExp =
    sequenceExpression.expressions[sequenceExpression.expressions.length - 1];

  return handleNode(nextCtx, finalExp);
}
