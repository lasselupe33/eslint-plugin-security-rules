import { ReturnStatement } from "@typescript-eslint/types/dist/ast-spec";
import { TSESTree, AST_NODE_TYPES } from "@typescript-eslint/utils";
import {
  findVariable,
  getInnermostScope,
} from "@typescript-eslint/utils/dist/ast-utils";

import {
  isFunctionDeclaration,
  isIdentifier,
  isReturnStatement,
} from "../../guards";
import { getNodeName } from "../get-node-name";
import {
  ParameterToArgumentMap,
  toParameterToArgumentKey,
} from "../parameter-to-argument";
import { HandlingContext, TraceNode } from "../types";

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
  { scope, connection, ruleContext }: HandlingContext,
  callExpression: TSESTree.CallExpression
): TraceNode[] {
  const foundNodes: TraceNode[] = [];

  if (!isIdentifier(callExpression.callee)) {
    return foundNodes;
  }

  // Initially we extract the variable of the function call
  const calleeVariable = findVariable(scope, callExpression.callee);

  if (!calleeVariable) {
    // In case an invalid program has been written, then we cannot infer the
    // next variable (Since none exist!). Let's convey this information
    // publicly.
    foundNodes.push({
      scope,
      value: "__undefined__",
      connection,
    });

    return foundNodes;
  }

  foundNodes.push({
    scope,
    variable: calleeVariable,
    connection,
  });

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
      scope: getInnermostScope(scope, callExpression),
    });
  });

  const returnStatements = functionDeclaration.body.body.filter(
    (node): node is ReturnStatement => isReturnStatement(node)
  );

  const returnStatementVariables = returnStatements.flatMap((returnStatement) =>
    handleNode(
      {
        ruleContext,
        scope,
        connection: {
          variable: calleeVariable,
          nodeType: AST_NODE_TYPES.CallExpression,
        },
        parameterToArgumentMap,
      },
      returnStatement.argument
    )
  );

  foundNodes.push(...returnStatementVariables);

  return foundNodes;
}
