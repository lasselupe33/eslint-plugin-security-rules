import { ParameterDefinition } from "@typescript-eslint/scope-manager";
import { TSESTree } from "@typescript-eslint/utils";

import { getModuleScope } from "../../ast/get-module-scope";
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
  isTaggedTemplateExpression,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { findReverse } from "../../find-reverse";
import { handleNode } from "../handlers/_handle-node";
import { Connection } from "../types/connection";
import { HandlingContext, ParameterContext } from "../types/context";
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
      (it) =>
        isCallExpression(it) ||
        isNewExpression(it) ||
        isTaggedTemplateExpression(it)
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

    // In case our restElement is defined as an array pattern, then it is
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
    if (indexOfParam !== -1 && argToParamContext) {
      let accessSkew: undefined | number;

      if (isRestElement(parameterNode)) {
        // In case we're accessing a particular element of the rest index (not
        // destructuring), we need to consume this access as well
        if (
          !Number.isNaN(
            Number(
              handlingContext.meta.memberPath[
                handlingContext.meta.memberPath.length - 1
              ]
            )
          )
        ) {
          accessSkew = Number(handlingContext.meta.memberPath.pop());
        }

        const node =
          argToParamContext.arguments[
            indexOfParam + (restSkew ?? 0) + (accessSkew ?? 0)
          ];

        // In case we are able to resolve to a specific element in the rest
        // array, then trace that.
        if (
          typeof restSkew !== "undefined" ||
          typeof accessSkew !== "undefined"
        ) {
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
          // ... else we'll fall back to trace all elements in the rest array
          return argToParamContext.arguments
            .slice(indexOfParam)
            .flatMap((node) =>
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

      const node = argToParamContext.arguments[indexOfParam];

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
