import { WriteableReference } from "../get-relevant-references";
import { HandlingContext, TraceNode } from "../types";

import { extractNextVariablesFromNode } from "./extract-next-variables-from-node";

export function visitReference(
  ctx: HandlingContext,
  reference: WriteableReference
): TraceNode[] {
  const relatedExpression = reference.writeExpr.parent;

  if (!relatedExpression) {
    return [];
  }

  return extractNextVariablesFromNode(ctx, relatedExpression);
}
