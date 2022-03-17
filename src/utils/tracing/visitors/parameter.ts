import { ParameterDefinition } from "@typescript-eslint/scope-manager";
import { TSESTree } from "@typescript-eslint/utils";

import {
  isArrayPattern,
  isArrowFunctionExpression,
  isCallExpression,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isNewExpression,
  isObjectPattern,
  isRestElement,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { findReverse } from "../../find-reverse";
import { getModuleScope } from "../../get-module-scope";
import { handleNode } from "../handlers/_handle-node";
import { Connection } from "../types/connection";
import {
  HandlingContext,
  isCallParameterContext,
  ParameterContext,
} from "../types/context";
import { makeUnresolvedTerminalNode, TraceNode } from "../types/nodes";

/**
 * When a variable is a parameter, then it means that we've reached a state
 * where we will have to map back to the original argument that the parameter
 * was initialised with.
 *
 * @TODO: Currently we do not handle nested arrow functions properly.
 */
export function visitParameter(
  ctx: HandlingContext,
  parameter: ParameterDefinition
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

  const relevantParameterContext = findRelevantParameterContext(ctx);

  if (!relevantParameterContext) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to resolve related parameter",
        astNodes: ctx.connection.astNodes,
        connection: ctx.connection,
        meta: ctx.meta,
      }),
    ];
  }

  return handleParameter(ctx, relevantParameterContext, parameter);
}

/**
 * Iterates over the current connection to determine the parameterContext that
 * is relevant for the current parameter
 */
function findRelevantParameterContext(
  ctx: HandlingContext
): ParameterContext | undefined {
  let currentConnection: Connection | undefined = ctx.connection;

  while (currentConnection != null) {
    const potentialIdentifier =
      currentConnection.astNodes[currentConnection.astNodes.length - 1];
    const hasCalls = currentConnection.astNodes.some(
      (it) => isCallExpression(it) || isNewExpression(it)
    );

    // We assume to have found the currect identifier as soon as we are in a
    // connection that ends on an identifier and also contains a call-expression
    // (as per call-expression handler implementation).
    if (
      isIdentifier(potentialIdentifier) &&
      hasCalls &&
      (getModuleScope(ctx.scope) === ctx.scope ||
        ctx.meta.parameterContext.get(potentialIdentifier)?.scope !== ctx.scope)
    ) {
      return ctx.meta.parameterContext.get(potentialIdentifier);
    }

    currentConnection = currentConnection.prevConnection;
  }
}

/**
 * Iterates over the given parameter which may be an ObjectPattern,
 * ArrayPattern, rest element etc. and traces the path to the used
 * parameter. This allows us to finally continue handling the related argument
 * with the correct handlingContext
 */
function handleParameter(
  handlingContext: HandlingContext,
  argToParamContext: ParameterContext | undefined,
  parameter: ParameterDefinition
): TraceNode[] {
  let currContext = handlingContext;
  const parameterNodes: TSESTree.Node[] = [];
  let parameterNode: TSESTree.Node | undefined = parameter.name;
  let restSkew: number | undefined;

  while (parameterNode != null && parameterNode !== parameter.node) {
    parameterNodes.push(parameterNode);

    // In case our parameter is within an object, then we need to extend the
    // memberPath of our handlingContext
    if (
      isObjectPattern(parameterNode.parent) &&
      !isRestElement(parameterNode)
    ) {
      const identifier = findReverse(parameterNodes, (it) =>
        isIdentifier(it) ? it : undefined
      );

      if (identifier) {
        currContext = deepMerge(currContext, {
          meta: {
            memberPath: [...currContext.meta.memberPath, identifier.name],
          },
        });
      }
    }

    // In case our restElemeent is defined as an array pattern, then it is
    // possible to trace to a specific argument instead of all possible
    // arguments that could take on the restElement value
    if (isArrayPattern(parameterNode)) {
      const elementInArray = parameterNodes[parameterNodes.length - 2];
      const index = parameterNode.elements.findIndex(
        (it) => it === elementInArray
      );

      if (isRestElement(parameterNode.parent)) {
        restSkew = index;
      } else {
        currContext = deepMerge(currContext, {
          meta: {
            memberPath: [...currContext.meta.memberPath, String(index)],
          },
        });
      }
    }

    const indexOfParam = parameter.node.params.findIndex(
      (param) => param === parameterNode
    );

    // Finally, in case the current node actually maps to the correct param,
    // then we can continue our trace
    if (indexOfParam !== -1 && isCallParameterContext(argToParamContext)) {
      const node = argToParamContext.arguments[indexOfParam + (restSkew ?? 0)];

      if (isRestElement(parameterNode)) {
        if (restSkew) {
          return handleNode(
            deepMerge(currContext, {
              connection: {
                astNodes: [...currContext.connection.astNodes, node],
              },
              scope: argToParamContext.scope,
            }),
            node
          );
        } else {
          argToParamContext.arguments.splice(indexOfParam).flatMap((node) =>
            handleNode(
              deepMerge(currContext, {
                connection: {
                  astNodes: [...currContext.connection.astNodes, node],
                },
                scope: argToParamContext.scope,
              }),
              node
            )
          );
        }
      }

      return handleNode(
        deepMerge(currContext, {
          connection: {
            astNodes: [...currContext.connection.astNodes, node],
          },
          scope: argToParamContext.scope,
        }),
        node
      );
    }

    parameterNode = parameterNode.parent;
  }

  return [
    makeUnresolvedTerminalNode({
      reason: "Unable to resolve parameter index",
      astNodes: handlingContext.connection.astNodes,
      connection: handlingContext.connection,
      meta: handlingContext.meta,
    }),
  ];
}
