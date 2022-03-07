import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { ConnectionFlags } from "../types/connection";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleAssignmentExpression(
  ctx: HandlingContext,
  assignmentExpression: TSESTree.AssignmentExpression
): TraceNode[] {
  // @TODO: determine if other expressions reassign values.
  if (assignmentExpression.operator === "=") {
    ctx.connection.flags.add(ConnectionFlags.REASSIGN);
  }

  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, assignmentExpression],
    },
  });

  return handleNode(nextCtx, assignmentExpression.right);
}
