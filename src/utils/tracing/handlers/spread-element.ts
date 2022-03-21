import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleSpreadElement(
  ctx: HandlingContext,
  spreadElement: TSESTree.SpreadElement
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, spreadElement],
    },
  });

  return handleNode(nextCtx, spreadElement.argument);
}
