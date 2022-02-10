import { Node } from "@typescript-eslint/types/dist/ast-spec";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { TraceContext } from "./_trace-variable";

export type WriteableReference = Omit<Scope.Reference, "writeExpr"> & {
  writeExpr: Node;
};

export function getRelevantReferences(
  { rootScope }: TraceContext,
  references: Scope.Reference[]
): WriteableReference[] {
  const relevantRefs: WriteableReference[] = [];

  for (let i = references.length - 1; i >= 0; i--) {
    const reference = references[i];

    if (reference?.writeExpr) {
      relevantRefs.push(reference as WriteableReference);

      // @TODO: Consider if we wish to limit amount of relevant references.
      // if (
      //   isAssignmentExpression(reference.writeExpr.parent) &&
      //   reference.writeExpr.parent.operator !== "+="
      // ) {
      //   break;
      // }
    }
  }

  return relevantRefs;
}
