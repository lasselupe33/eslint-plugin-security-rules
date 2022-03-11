import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

// E.g. const b = a++;

export function handleUpdateExpression(
  ctx: HandlingContext,
  updateExpression: TSESTree.UpdateExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, updateExpression],
    },
  });

  return handleNode(nextCtx, updateExpression.argument);
}
