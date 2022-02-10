import { findVariable } from "@typescript-eslint/utils/dist/ast-utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { getFunctionName } from "../../ast";
import { isFunctionDeclaration, isParameter } from "../../guards";
import { getNodeName } from "../get-node-name";
import { HandlingContext, TraceNode } from "../types";

import { extractNextVariablesFromNode } from "./extract-next-variables-from-node";

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
    `${functionName}-${parameterName}`
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

  const toFollow = relatedVariable.defs[0];

  if (isParameter(toFollow)) {
    return visitParameter(ctx, toFollow);
  } else {
    return extractNextVariablesFromNode(ctx, toFollow?.node);
  }
}
