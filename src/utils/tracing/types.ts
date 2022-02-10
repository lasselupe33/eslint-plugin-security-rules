import { CallExpressionArgument } from "@typescript-eslint/types/dist/ast-spec";
import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

export type ParameterToArgumentMap = Map<
  string,
  { argument: CallExpressionArgument | undefined; scope: Scope.Scope }
>;

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

export function isTerminalNode(node: TraceNode): node is TerminalNode {
  return "value" in node;
}
