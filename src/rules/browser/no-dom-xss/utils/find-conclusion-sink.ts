import { TSESTree } from "@typescript-eslint/utils";

import { TypeProgram } from "../../../../utils/types/getTypeProgram";
import { RawSink } from "../sinks";

import { isSinkRelevant } from "./is-sink-relevant";

// In case our potential sink lives in any of these globals, then it should
// still be considered a match.
const GLOBALS = ["globalThis", "window", "document"];

/**
 * Once we've traversed the full node declaration and limited the potential
 * sinks in the process, then this function will determine if our candidate is a
 * match of one of the final possible sinks.
 */
export function findConclusionSink<Sink extends RawSink>(
  typeProgram: TypeProgram,
  node: TSESTree.Expression,
  currentIdentifierName: string,
  matchIn: Sink[]
) {
  return matchIn.find(
    (sink) =>
      (sink.identifier.length === 0 &&
        GLOBALS.includes(currentIdentifierName)) ||
      (sink.identifier.length === 1 &&
        isSinkRelevant(typeProgram, node, currentIdentifierName, sink))
  );
}
