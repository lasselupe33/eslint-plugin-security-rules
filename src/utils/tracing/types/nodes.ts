import { TSESTree } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { Connection } from "./connection";
import { Meta } from "./context";

type BaseNode = {
  astNodes: TSESTree.Node[];
};

type BaseTerminalNode = BaseNode & {
  __isTerminalNode: true;
  connection: Connection | undefined;
};

export type ConstantTerminalNode = BaseTerminalNode & {
  type: "constant";
  value: string;
};

export type ImportTerminalNode = BaseTerminalNode & {
  type: "import";
  imported: string;
  source: string;
};

export type UnresolvedTerminalNode = BaseTerminalNode & {
  type: "unresolved";
  reason: string;
};

export type NodeTerminalNode = BaseTerminalNode & {
  type: "node";
  astNode: TSESTree.Node;
};

/**
 * Specification of nodes that can be returned while tracing
 */
export type TerminalNode =
  | ConstantTerminalNode
  | ImportTerminalNode
  | UnresolvedTerminalNode
  | NodeTerminalNode;

export type VariableNode = BaseNode & {
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

export function makeImportTerminalNode(
  node: Omit<ImportTerminalNode, "type" | "__isTerminalNode">
): ImportTerminalNode {
  return {
    __isTerminalNode: true,
    type: "import",
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

export function makeNodeTerminalNode(
  node: Omit<NodeTerminalNode, "type" | "__isTerminalNode">
): NodeTerminalNode {
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

export function isImportTerminalNode(
  node: TraceNode | undefined
): node is ImportTerminalNode {
  return isTerminalNode(node) && node.type === "import";
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
