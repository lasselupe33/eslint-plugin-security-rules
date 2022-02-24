import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { getFunctionName } from "../../ast/ast";
import { isFunctionDeclaration } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { getNodeName } from "../get-node-name";
import { handleNode } from "../handlers/_handle-node";
import { toParameterToArgumentKey } from "../parameter-to-argument";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

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
  if (
    !isFunctionDeclaration(parameter.node) ||
    !ctx.meta.parameterToArgumentMap
  ) {
    return [];
  }

  const functionName = getFunctionName(parameter.node);
  const parameterName = getNodeName(parameter.name);
  const key = toParameterToArgumentKey(functionName, parameterName);
  const argument = ctx.meta.parameterToArgumentMap.get(key);

  if (!argument?.argument) {
    console.warn(`Failed to map parameter (${key}) to initialising argument`);

    return [];
  }

  return handleNode(
    deepMerge(ctx, {
      connection: {
        astNodes: [...ctx.connection.astNodes, argument.argument],
      },
      scope: argument.scope,
    }),
    argument.argument
  );
}
