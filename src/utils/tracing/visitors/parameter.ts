import { findVariable } from "@typescript-eslint/utils/dist/ast-utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { getFunctionName } from "../../ast";
import { isFunctionDeclaration, isLiteral, isParameter } from "../../guards";
import { getNodeName } from "../get-node-name";
import { getRelevantReferences } from "../get-relevant-references";
import { toParameterToArgumentKey } from "../parameter-to-argument";
import { HandlingContext, TraceNode } from "../types";

import { visitReference } from "./reference";

/**
 * When a variable is a parameter, then it means that we've reached a state
 * where we will have to map back to the original argument that the parameter
 * was initialised with.
 *
 * This mapping is contained and defined within the parameterToArgument map. In
 * case we cannot recreate such a mapping we fail silently.
 */
export function visitParameter(
  ctx: HandlingContext,
  parameter: Scope.Definition
): TraceNode[] {
  if (!isFunctionDeclaration(parameter.node) || !ctx.parameterToArgumentMap) {
    return [];
  }

  const functionName = getFunctionName(parameter.node);
  const parameterName = getNodeName(parameter.name);
  const key = toParameterToArgumentKey(functionName, parameterName, "get");
  const argument = ctx.parameterToArgumentMap.get(key);

  if (!argument) {
    console.warn(`Failed to map parameter (${key}) to initialising argument`);

    return [];
  }

  // In case our argumnt was a literal, then we cannot continue tracing. And as
  // such we simply return a terminal node.
  if (isLiteral(argument.argument)) {
    return [
      { value: String(argument.argument.value), connection: ctx.connection },
    ];
  }

  const relatedVariable = findVariable(
    argument.scope,
    getNodeName(argument.argument)
  );

  if (!relatedVariable) {
    return [];
  }

  const relatedParameter = relatedVariable.defs[0];

  if (isParameter(relatedParameter)) {
    return visitParameter(ctx, relatedParameter);
  } else {
    const references = getRelevantReferences(relatedVariable.references);

    return references.flatMap((reference) => visitReference(ctx, reference));
  }
}
