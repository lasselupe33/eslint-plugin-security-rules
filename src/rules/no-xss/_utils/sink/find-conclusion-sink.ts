import { TSESTree } from "@typescript-eslint/utils";

import { TypeProgram } from "../../../../utils/types/get-type-program";

import { isSinkRelevant } from "./is-sink-relevant";
import { RawSink } from "./types";

/**
 * Once we've traversed the full node declaration and limited the potential
 * sinks in the process, then this function will determine if our candidate is a
 * match of one of the final possible sinks.
 */
export function findConclusionSink<Sink extends RawSink>(
  typeProgram: TypeProgram,
  node: TSESTree.Expression | TSESTree.JSXIdentifier,
  currentIdentifierName: string,
  matchIn: Sink[]
) {
  return matchIn.filter(
    (sink) =>
      sink.identifier.length === 0 ||
      (sink.identifier.length === 1 &&
        isSinkRelevant(typeProgram, node, currentIdentifierName, sink))
  );
}
