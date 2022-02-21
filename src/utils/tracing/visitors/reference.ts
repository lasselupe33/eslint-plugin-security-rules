import { WriteableReference } from "../get-relevant-references";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

export function visitReference(
  ctx: HandlingContext,
  reference: WriteableReference
): TraceNode[] {
  const relatedExpression = reference.writeExpr.parent;

  if (!relatedExpression) {
    return [];
  }

  return handleNode(ctx, relatedExpression);
}
