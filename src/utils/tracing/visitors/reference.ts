import { WriteableReference } from "../get-relevant-references";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import { makeUnresolvedTerminalNode, TraceNode } from "../types/nodes";

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
      }),
    ];
  }

  return handleNode(ctx, relatedExpression);
}
