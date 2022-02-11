import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { ParameterToArgumentMap } from "./parameter-to-argument";

/**
 * Context available to all handlers when tracing a given node
 */
export type HandlingContext = {
  ruleContext: RuleContext<string, unknown[]>;
  connection: Scope.Variable | undefined;
  scope: Scope.Scope;
  parameterToArgumentMap: ParameterToArgumentMap;
};

/**
 * Specification of nodes that can be returned while tracing
 */
export type TerminalNode = {
  value: string;
  connection?: Scope.Variable | undefined;
};

export type VariableNode = {
  variable: Scope.Variable;
  connection?: Scope.Variable | undefined;
  scope: Scope.Scope;
  parameterToArgumentMap?: ParameterToArgumentMap | undefined;
};

export type TraceNode = TerminalNode | VariableNode;

export function isVariableNode(
  node: TraceNode | undefined
): node is VariableNode {
  return node != null && "variable" in node;
}

export function isTerminalNode(
  node: TraceNode | undefined
): node is TerminalNode {
  return node != null && "value" in node;
}
