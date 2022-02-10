import { TSESTree } from "@typescript-eslint/utils";
import { findVariable } from "@typescript-eslint/utils/dist/ast-utils";

import { HandlingContext, TraceNode } from "../types";

export function handleIdentifier(
  { scope, connection, parameterToArgumentMap }: HandlingContext,
  identifier: TSESTree.Identifier
): TraceNode[] {
  const variable = findVariable(scope, identifier);

  return variable
    ? [{ variable, connection, scope, parameterToArgumentMap }]
    : [];
}
