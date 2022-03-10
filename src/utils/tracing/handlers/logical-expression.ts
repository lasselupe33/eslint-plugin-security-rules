import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleLogicalExpression(
  ctx: HandlingContext,
  logicalExpression: TSESTree.LogicalExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, logicalExpression],
    },
  });

  return [
    ...handleNode(nextCtx, logicalExpression.left),
    ...handleNode(nextCtx, logicalExpression.right),
  ];
}
