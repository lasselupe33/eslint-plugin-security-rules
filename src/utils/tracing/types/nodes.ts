import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { Connection } from "./connection";
import { Meta } from "./context";

type BaseTerminalNode = {
  __isTerminalNode: true;
  connection: Connection | undefined;
};

type ConstantTerminalNode = BaseTerminalNode & {
  type: "constant";
  value: unknown;
};

type UnresolvedTerminalNode = BaseTerminalNode & {
  type: "unresolved";
  reason: string;
};

type NodeTerminalNode<NodeType extends AST_NODE_TYPES = AST_NODE_TYPES> =
  BaseTerminalNode & {
    type: "node";
    nodeType: NodeType;
    node: TSESTree.Node & { type: NodeType };
  };

/**
 * Specification of nodes that can be returned while tracing
 */
export type TerminalNode =
  | ConstantTerminalNode
  | UnresolvedTerminalNode
  | NodeTerminalNode;

export type VariableNode = {
  __isVariableNode: true;

  variable: Scope.Variable;
  connection: Connection | undefined;
  scope: Scope.Scope;
  meta: Meta;
};

export type TraceNode = TerminalNode | VariableNode;

export function makeConstantTerminalNode(
  node: Omit<ConstantTerminalNode, "type" | "__isTerminalNode">
): ConstantTerminalNode {
  return {
    __isTerminalNode: true,
    type: "constant",
    ...node,
  };
}

export function makeUnresolvedTerminalNode(
  node: Omit<UnresolvedTerminalNode, "type" | "__isTerminalNode">
): UnresolvedTerminalNode {
  return {
    __isTerminalNode: true,
    type: "unresolved",
    ...node,
  };
}

export function makeNodeTerminalNode<NodeType extends AST_NODE_TYPES>(
  node: Omit<NodeTerminalNode<NodeType>, "type" | "__isTerminalNode">
): NodeTerminalNode<NodeType> {
  return {
    __isTerminalNode: true,
    type: "node",
    ...node,
  };
}

export function makeVariableNode(
  node: Omit<VariableNode, "__isVariableNode">
): VariableNode {
  return {
    __isVariableNode: true,
    ...node,
  };
}

export function isConstantTerminalNode(
  node: TraceNode | undefined
): node is ConstantTerminalNode {
  return isTerminalNode(node) && node.type === "constant";
}

export function isUnresolvedTerminalNode(
  node: TraceNode | undefined
): node is UnresolvedTerminalNode {
  return isTerminalNode(node) && node.type === "unresolved";
}

export function isNodeTerminalNode(
  node: TraceNode | undefined
): node is NodeTerminalNode {
  return isTerminalNode(node) && node.type === "node";
}

export function isTerminalNode(
  node: TraceNode | undefined
): node is TerminalNode {
  return node != null && "__isTerminalNode" in node;
}

export function isVariableNode(
  node: TraceNode | undefined
): node is VariableNode {
  return node != null && "__isVariableNode" in node;
}
