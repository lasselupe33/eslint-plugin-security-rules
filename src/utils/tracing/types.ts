import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { ParameterToArgumentMap } from "./parameter-to-argument";

export enum ConnectionTypes {
  MODIFICATION = "modification",
}

/**
 * Specification of data that will be passed through the entire tracing
 * algorithm, allowing handlers to send additional metadata to future handlers
 */
type Meta = {
  /**
   * Mapping between parameters and arguments which is useful when entering
   * and exiting functions, where we need to ensure we exit back to the
   * correct argument.
   */
  parameterToArgumentMap: ParameterToArgumentMap | undefined;

  /**
   * Specifies the identifiers that we have traversed on a member that is yet
   * to be resolved to its actual value.
   */
  memberPath: string[];
};

type Connection = {
  variable?: Scope.Variable | undefined;
  nodeType?: (AST_NODE_TYPES | "Argument") | undefined;
  type?: ConnectionTypes | undefined;
};

/**
 * Context available to all handlers when tracing a given node
 */
export type HandlingContext = {
  ruleContext: RuleContext<string, unknown[]>;
  connection: Connection;
  scope: Scope.Scope;
  meta: Meta;
};

/**
 * Specification of nodes that can be returned while tracing
 */
export type TerminalNode = {
  value: string;
  type: "constant" | "variable" | "unresolved" | "identifier";
  connection?: Connection | undefined;
};

export type VariableNode = {
  variable: Scope.Variable;
  connection?: Connection | undefined;
  scope: Scope.Scope;
  meta: Meta;
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
