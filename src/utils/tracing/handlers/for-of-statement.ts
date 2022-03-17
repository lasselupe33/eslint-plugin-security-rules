import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleForOfStatement(
  ctx: HandlingContext,
  statement: TSESTree.ForOfStatement
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, statement],
    },
  });

  return handleNode(nextCtx, statement.right);
}
