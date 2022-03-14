import { TSESTree } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import {
  isArrowFunctionExpression,
  isCallExpression,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isNewExpression,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { handleNode } from "../handlers/_handle-node";
import { Connection } from "../types/connection";
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
        meta: ctx.meta,
      }),
    ];
  }

  const calleeIdentifierNode = findRelevantCallIdentifier(ctx.connection);

  if (!calleeIdentifierNode) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to resolve related parameter",
        astNodes: ctx.connection.astNodes,
        connection: ctx.connection,
        meta: ctx.meta,
      }),
    ];
  }

  const relevantArguments = ctx.meta.activeArguments.get(calleeIdentifierNode);
  const indexOfParam = parameter.node.params.findIndex(
    (param) => param === parameter.name
  );

  const argument = relevantArguments?.[indexOfParam];

  if (!argument?.argument) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to resolve parameter index",
        astNodes: ctx.connection.astNodes,
        connection: ctx.connection,
        meta: ctx.meta,
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

function findRelevantCallIdentifier(
  connection: Connection
): TSESTree.Identifier | undefined {
  let currentConnection: Connection | undefined = connection;

  while (currentConnection != null) {
    const node =
      currentConnection.astNodes[currentConnection.astNodes.length - 1];

    // In case we've need to map anonymous functions parameters to arguments,
    // then we assume it is called from the last available call expression.
    if (
      isIdentifier(node) &&
      (isCallExpression(node.parent) || isNewExpression(node.parent))
    ) {
      return node;
    }

    currentConnection = currentConnection.prevConnection;
  }
}
