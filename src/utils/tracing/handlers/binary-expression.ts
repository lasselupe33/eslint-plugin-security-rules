import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { ConnectionTypes, HandlingContext, TraceNode } from "../types";

import { handleNode } from "./_handle-node";

export function handleBinaryExpression(
  ctx: HandlingContext,
  expression: TSESTree.BinaryExpression
): TraceNode[] {
  const nextCtx: HandlingContext = {
    ...ctx,
    connection: {
      ...ctx.connection,
      nodeType: AST_NODE_TYPES.BinaryExpression,
      type: ConnectionTypes.MODIFICATION,
    },
  };

  return [
    ...handleNode(nextCtx, expression.left),
    ...handleNode(nextCtx, expression.right),
  ];
}
