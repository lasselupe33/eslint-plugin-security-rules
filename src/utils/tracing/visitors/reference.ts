import { WriteableReference } from "../get-relevant-references";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

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
