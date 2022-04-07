import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import { makeUnresolvedTerminalNode, TraceNode } from "../types/nodes";
import { WriteableReference } from "../utils/get-relevant-references";

export function visitReference(
  ctx: HandlingContext,
  reference: WriteableReference
): TraceNode[] {
  const relatedExpression = reference.writeExpr.parent;

  if (!relatedExpression) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to visit reference",
        connection: ctx.connection,
        astNodes: ctx.connection.astNodes,
        meta: ctx.meta,
      }),
    ];
  }

  return handleNode(ctx, relatedExpression);
}
