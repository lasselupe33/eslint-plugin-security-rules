import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

// E.g. const b = !a;

export function handleUnaryExpression(
  ctx: HandlingContext,
  unaryExpression: TSESTree.UnaryExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, unaryExpression],
    },
  });

  return handleNode(nextCtx, unaryExpression.argument);
}
