import { TSESTree } from "@typescript-eslint/utils";
import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { Connection } from "./connection";
import { Meta } from "./context";

type BaseNode = {
  astNodes: TSESTree.Node[];
  meta: Meta;
};

type BaseTerminalNode = BaseNode & {
  __isTerminalNode: true;
  connection: Connection;
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

export type GlobalTerminalNode = BaseTerminalNode & {
  type: "global";
  name: string;
};

type UnresolvedTypes = "parameter" | "unknown";

export type UnresolvedTerminalNode = BaseTerminalNode & {
  type: "unresolved";
  reason: string;
  kind: UnresolvedTypes;
};

export type NodeTerminalNode = BaseTerminalNode & {
  type: "node";
  astNode: TSESTree.Node;
};

export type RootNode = {
  __isRootNode: true;
  astNodes: [];
};

/**
 * Specification of nodes that can be returned while tracing
 */
export type TerminalNode =
  | ConstantTerminalNode
  | ImportTerminalNode
  | GlobalTerminalNode
  | UnresolvedTerminalNode
  | NodeTerminalNode;

export type VariableNode = BaseNode & {
  __isVariableNode: true;

  variable: Scope.Variable;
  connection: Connection;
  scope: Scope.Scope;
  rootScope: Scope.Scope;
  ruleContext: RuleContext<string, readonly unknown[]>;
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

export function makeGlobalTerminalNode(
  node: Omit<GlobalTerminalNode, "type" | "__isTerminalNode">
): GlobalTerminalNode {
  return {
    __isTerminalNode: true,
    type: "global",
    ...node,
  };
}

export function makeUnresolvedTerminalNode(
  node: Omit<UnresolvedTerminalNode, "type" | "__isTerminalNode" | "kind"> & {
    kind?: UnresolvedTypes;
  }
): UnresolvedTerminalNode {
  return {
    __isTerminalNode: true,
    type: "unresolved",
    ...node,
    kind: node.kind ?? "unknown",
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

export function makeRootNode(): RootNode {
  return {
    __isRootNode: true,
    astNodes: [],
  };
}

export function isConstantTerminalNode(
  node: TraceNode | RootNode | undefined
): node is ConstantTerminalNode {
  return isTerminalNode(node) && node.type === "constant";
}

export function isImportTerminalNode(
  node: TraceNode | RootNode | undefined
): node is ImportTerminalNode {
  return isTerminalNode(node) && node.type === "import";
}

export function isGlobalTerminalNode(
  node: TraceNode | RootNode | undefined
): node is GlobalTerminalNode {
  return isTerminalNode(node) && node.type === "global";
}

export function isUnresolvedTerminalNode(
  node: TraceNode | RootNode | undefined
): node is UnresolvedTerminalNode {
  return isTerminalNode(node) && node.type === "unresolved";
}

export function isNodeTerminalNode(
  node: TraceNode | RootNode | undefined
): node is NodeTerminalNode {
  return isTerminalNode(node) && node.type === "node";
}

export function isTerminalNode(
  node: TraceNode | RootNode | undefined
): node is TerminalNode {
  return node != null && "__isTerminalNode" in node;
}

export function isVariableNode(
  node: TraceNode | RootNode | undefined
): node is VariableNode {
  return node != null && "__isVariableNode" in node;
}

export function isRootNode(
  node: TraceNode | RootNode | undefined
): node is RootNode {
  return node != null && "__isRootNode" in node;
}
