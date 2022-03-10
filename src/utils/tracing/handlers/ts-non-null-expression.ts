import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleTSNonNullExpression(
  ctx: HandlingContext,
  TSNonNullExpression: TSESTree.TSNonNullExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, TSNonNullExpression],
    },
  });

  return handleNode(nextCtx, TSNonNullExpression.expression);
}
