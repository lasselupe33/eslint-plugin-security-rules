import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { HandlingContext, TraceNode } from "../types";

export function handleAssignmentPattern(
  ctx: HandlingContext,
  assignmentPattern: TSESTree.AssignmentPattern
): TraceNode[] {
  const nextCtx: HandlingContext = {
    ...ctx,
    connection: {
      ...ctx.connection,
      nodeType: AST_NODE_TYPES.AssignmentPattern,
    },
  };

  return [];
}
