import { TSESTree } from "@typescript-eslint/utils";

import { TypeProgram } from "../../../../utils/types/get-type-program";

import { RawSink } from "./data";
import { isSinkRelevant } from "./is-sink-relevant";

/**
 * Iterates over a list of potential sinks that the current node may be.
 * Returns a limited subset of sinks that still matches the current node.
 */
export function findMatchingSinks<Sink extends RawSink>(
  typeProgram: TypeProgram,
  node: TSESTree.Expression,
  currentIdentifierName: string,
  matchIn: Sink[]
) {
  return matchIn
    .filter((sink) =>
      isSinkRelevant(typeProgram, node, currentIdentifierName, sink)
    )
    .map((sink) => ({
      ...sink,
      identifier: sink.identifier.slice(0, -1),
    }));
}
