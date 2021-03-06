import { TSESTree } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

export type WriteableReference = Omit<Scope.Reference, "writeExpr"> & {
  writeExpr: TSESTree.Node;
};

export function getRelevantReferences(
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
