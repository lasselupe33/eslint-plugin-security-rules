import { TSESTree } from "@typescript-eslint/utils";

import { getNodeType } from "../../../../utils/types/get-node-type";
import { TypeProgram } from "../../../../utils/types/get-type-program";

import { RawSink } from "./data";

/**
 * Iterates through all the remaining possible sinks and returns the remaining
 * sinks that the is still a part of.
 */
export function isSinkRelevant<Sink extends RawSink>(
  typeProgram: TypeProgram,
  node: TSESTree.Expression,
  currentIdentifierName: string,
  sink: Sink
): boolean {
  const relevantSinkIdentifier = sink.identifier[sink.identifier.length - 1];

  if (!relevantSinkIdentifier) {
    return false;
  }

  // In case the current sink identifier should not be matched on its name,
  // then we fall back to attempt to parse it based on its type information
  if (relevantSinkIdentifier.name === "__irrelevant__") {
    const { typeName, baseTypeNames, returnTypeNames } = getNodeType(
      typeProgram,
      node
    );

    // In case we cannot extract type information then we should fall back
    // to simply assuming the type matches (Prefer false positives over
    // false negatives)
    if (typeName === undefined) {
      return true;
    }

    return (
      typeName === relevantSinkIdentifier.type ||
      baseTypeNames.includes(relevantSinkIdentifier.type as string) ||
      returnTypeNames.includes(relevantSinkIdentifier.type as string)
    );
  }

  const isMatchBasedOnName = relevantSinkIdentifier?.isPrefix
    ? relevantSinkIdentifier?.name.startsWith(currentIdentifierName)
    : relevantSinkIdentifier?.name === currentIdentifierName;

  return isMatchBasedOnName;
}
