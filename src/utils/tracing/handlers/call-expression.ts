import { ReturnStatement } from "@typescript-eslint/types/dist/ast-spec";
import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { isFunctionDeclaration, isReturnStatement } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { getModuleScope } from "../../get-module-scope";
import { getNodeName } from "../get-node-name";
import {
  ParameterToArgumentMap,
  toParameterToArgumentKey,
} from "../parameter-to-argument";
import { HandlingContext } from "../types/context";
import {
  isVariableNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";

import { handleNode } from "./_handle-node";

/**
 * When we encounter call expressions, then we have to extract variables at
 * potentially three distinct places.
 *
 * 1. The variable of the function being called (in the context of the call
 * itself)
 * 2. The variables returned from the function
 * 3. The variables of the parameters that the return statement depends on
 */
export function handleCallExpression(
  ctx: HandlingContext,
  callExpression: TSESTree.CallExpression
): TraceNode[] {
  const foundNodes: TraceNode[] = [];

  const calleeNode = handleNode(ctx, callExpression.callee)[0];

  if (!isVariableNode(calleeNode)) {
    // In case an invalid program has been written, then we cannot infer the
    // next variable (Since none exist!). Let's convey this information
    // publicly.
    foundNodes.push(
      makeUnresolvedTerminalNode({
        astNodes: [...ctx.connection.astNodes, callExpression],
        reason: "Unable to resolve callee",
        connection: ctx.connection,
      })
    );

    return foundNodes;
  }

  // Initially we extract the variable of the function call
  const calleeVariable = calleeNode.variable;
  foundNodes.push(calleeNode);

  // ... then we look at the declaration of the function to determine its return
  // variables.
  const functionDeclaration = calleeVariable.defs[0]?.node;

  if (!isFunctionDeclaration(functionDeclaration) || !functionDeclaration.id) {
    return foundNodes;
  }

  // Extend map with the relevant argument to parameter mappings.
  const parameterToArgumentMap: ParameterToArgumentMap = new Map();

  functionDeclaration.params.map(getNodeName).forEach((name, index) => {
    const key = toParameterToArgumentKey(calleeVariable.name, name);

    parameterToArgumentMap.set(key, {
      argument: callExpression.arguments[index],
      scope: getInnermostScope(ctx.scope, callExpression),
    });
  });

  const returnStatements = functionDeclaration.body.body.filter(
    (node): node is ReturnStatement => isReturnStatement(node)
  );

  const returnStatementVariables = returnStatements.flatMap((returnStatement) =>
    handleNode(
      deepMerge(ctx, {
        connection: {
          astNodes: [
            ...ctx.connection.astNodes,
            callExpression,
            ...calleeNode.astNodes,
          ],
          variable: calleeVariable,
        },
        meta: {
          parameterToArgumentMap,
        },
        scope: getInnermostScope(
          getModuleScope(ctx.ruleContext.getScope()),
          returnStatement
        ),
      }),
      returnStatement.argument
    )
  );

  foundNodes.push(...returnStatementVariables);

  return foundNodes;
}
