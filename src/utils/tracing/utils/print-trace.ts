import {
  isConstantTerminalNode,
  isImportTerminalNode,
  isNodeTerminalNode,
  isTerminalNode,
  isUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";

export function printTrace(trace: TraceNode[]): void {
  console.warn(trace.map(nodeToString).join(" --> "));
  console.warn();
}

function nodeToString(node: TraceNode): string {
  const flags = `${
    node.connection.flags.size > 0
      ? `/${Array.from(node.connection.flags).join("-")}`
      : ""
  }`;
  const finalAstNode = node.astNodes[node.astNodes.length - 1];

  if (isTerminalNode(node)) {
    const postfix = `(${finalAstNode ? finalAstNode.type : ""}/${
      node.astNodes.length
    }/${node.type}${flags})`;

    if (isConstantTerminalNode(node)) {
      return `"${node.value}" ${postfix}`;
    }

    if (isUnresolvedTerminalNode(node)) {
      return `${node.reason} ${postfix}`;
    }

    if (isNodeTerminalNode(node)) {
      return `${node.astNode.type} ${postfix}`;
    }

    if (isImportTerminalNode(node)) {
      return `{ imported: ${node.imported}, source: ${node.source} } ${postfix}`;
    }

    return `---unknown-trace-node---(${node})`;
  } else {
    return `${node.variable.name} (${node.variable.defs[0]?.type ?? ""}/${
      node.astNodes.length
    }${flags})`;
  }
}
