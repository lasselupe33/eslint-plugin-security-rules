import { findVariable } from "@typescript-eslint/utils/dist/ast-utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { getFunctionName } from "../../ast";
import { isFunctionDeclaration, isParameter } from "../../guards";
import { getNodeName } from "../get-node-name";
import { getRelevantReferences } from "../get-relevant-references";
import { toParameterToArgumentKey } from "../parameter-to-argument";
import { HandlingContext, TraceNode } from "../types";

import { visitReference } from "./reference";

export function visitParameter(
  ctx: HandlingContext,
  parameter: Scope.Definition
): TraceNode[] {
  if (!isFunctionDeclaration(parameter.node)) {
    return [];
  }

  const functionName = getFunctionName(parameter.node);
  const parameterName = getNodeName(parameter.name);
  const argument = ctx.parameterToArgumentMap?.get(
    toParameterToArgumentKey(functionName, parameterName, "get")
  );

  if (!argument) {
    return [];
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
