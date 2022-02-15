import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { ParameterToArgumentMap } from "./parameter-to-argument";

export enum ConnectionTypes {
  MODIFICATION = "modification",
}

type Connection = {
  variable: Scope.Variable | undefined;
  nodeType: (AST_NODE_TYPES | "Argument") | undefined;
  type?: ConnectionTypes | undefined;
};

/**
 * Context available to all handlers when tracing a given node
 */
export type HandlingContext = {
  ruleContext: RuleContext<string, unknown[]>;
  connection: Connection | undefined;
  scope: Scope.Scope;
  parameterToArgumentMap: ParameterToArgumentMap | undefined;
};

/**
 * Specification of nodes that can be returned while tracing
 */
export type TerminalNode = {
  value: string;
  type: "constant" | "variable" | "unresolved";
  connection?: Connection | undefined;
};

export type VariableNode = {
  variable: Scope.Variable;
  connection?: Connection | undefined;
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
