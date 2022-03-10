import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import {
  isArrowFunctionExpression,
  isClassDeclaration,
  isFunctionDeclaration,
  isFunctionExpression,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import { makeUnresolvedTerminalNode, TraceNode } from "../types/nodes";

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
    !isArrowFunctionExpression(parameter.node) &&
    !isFunctionDeclaration(parameter.node) &&
    !isFunctionExpression(parameter.node)
  ) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to resolve parameter to argument",
        astNodes: ctx.connection.astNodes,
        connection: ctx.connection,
      }),
    ];
  }

  const id =
    parameter.node.id ??
    // Classes will not have an id attached when reaching constructor
    // parameters. Luckily argument to parameter mapping is bound upon the name
    // of the class being called.
    (isClassDeclaration(ctx.scope.block) ? ctx.scope.block.id : undefined);

  if (!id) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to resolve parameter node id",
        astNodes: ctx.connection.astNodes,
        connection: ctx.connection,
      }),
    ];
  }

  const relevantArguments = ctx.meta.activeArguments[id.name];
  const earliestCallArguments = relevantArguments?.shift();
  const indexOfParam = parameter.node.params.findIndex(
    (param) => param === parameter.name
  );

  const argument = earliestCallArguments?.[indexOfParam];

  if (!argument?.argument) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to resolve parameter index",
        astNodes: ctx.connection.astNodes,
        connection: ctx.connection,
      }),
    ];
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
