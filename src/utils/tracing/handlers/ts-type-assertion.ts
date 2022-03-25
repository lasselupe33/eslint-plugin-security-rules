import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleTSTypeAssertion(
  ctx: HandlingContext,
  TSTypeAssertion: TSESTree.TSTypeAssertion
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, TSTypeAssertion],
    },
  });

  return handleNode(nextCtx, TSTypeAssertion.expression);
}
