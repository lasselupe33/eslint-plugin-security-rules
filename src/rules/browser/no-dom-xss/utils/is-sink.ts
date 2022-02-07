import { TSESTree } from "@typescript-eslint/utils";

import { isIdentifier, isMemberExpression } from "../../../../utils/guards";
import { TypeProgram } from "../../../../utils/types/getTypeProgram";
import { RawSink, SinkTypes } from "../sinks";

import { findConclusionSink } from "./find-conclusion-sink";
import { findMatchingSinks } from "./find-matching-sinks";

/**
 * Takes an expression to determine if it assigns data to an XSS sink.
 *
 * NB: This function will iterate through all definitions of the expression to
 * eventually determine if it matches any of our predefined vulnerable sinks.
 *
 * (e.g. window.location.href will recursively check if "href" is part of a
 * known sink, then "location" and finally "window").
 */
export function isSink<Sink extends RawSink>(
  typeProgram: TypeProgram,
  expression: TSESTree.Expression,
  matchIn: Sink[]
): SinkTypes | undefined {
  // Once the expression has been reduced to an identifier, then we've reached
  // the root and thus we determine if a conclusion sink exists for the given
  // traversal.
  if (isIdentifier(expression)) {
    const sink = findConclusionSink(
      typeProgram,
      expression,
      expression.name,
      matchIn
    );

    return sink?.type;
  } else if (
    isMemberExpression(expression) &&
    isIdentifier(expression.property)
  ) {
    const remainingMatches = findMatchingSinks(
      typeProgram,
      expression,
      expression.property.name,
      matchIn
    );

    return isSink(typeProgram, expression.object, remainingMatches);
  }
}
