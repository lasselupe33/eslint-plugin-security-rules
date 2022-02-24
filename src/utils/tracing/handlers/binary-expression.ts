import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { ConnectionTypes } from "../types/connection";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleBinaryExpression(
  ctx: HandlingContext,
  expression: TSESTree.BinaryExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, expression],
      type: ConnectionTypes.MODIFICATION,
    },
  });

  return [
    ...handleNode(nextCtx, expression.left),
    ...handleNode(nextCtx, expression.right),
  ];
}
