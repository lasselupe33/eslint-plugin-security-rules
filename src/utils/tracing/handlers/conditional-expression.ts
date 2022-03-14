import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleConditionalExpression(
  ctx: HandlingContext,
  conditionalExpression: TSESTree.ConditionalExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, conditionalExpression],
    },
  });

  return [
    ...handleNode(nextCtx, conditionalExpression.consequent),
    ...handleNode(nextCtx, conditionalExpression.alternate),
  ];
}
