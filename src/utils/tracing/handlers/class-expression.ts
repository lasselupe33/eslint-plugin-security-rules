import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { makeNodeTerminalNode, TraceNode } from "../types/nodes";

export function handleClassExpression(
  ctx: HandlingContext,
  expression: TSESTree.ClassExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, expression],
    },
  });

  return [
    makeNodeTerminalNode({
      astNode: expression,
      astNodes: nextCtx.connection.astNodes,
      connection: nextCtx.connection,
      meta: nextCtx.meta,
    }),
  ];
}
