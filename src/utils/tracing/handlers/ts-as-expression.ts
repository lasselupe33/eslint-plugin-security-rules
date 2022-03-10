import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleTSAsExpression(
  ctx: HandlingContext,
  TSAsExpression: TSESTree.TSAsExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, TSAsExpression],
    },
  });

  return handleNode(nextCtx, TSAsExpression.expression);
}
