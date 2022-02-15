import { isTerminalNode, TraceNode } from "../types";

export function printTrace(trace: TraceNode[]): void {
  console.warn(trace.map(nodeToString).join(" --> "));
  console.warn();
}

function nodeToString(node: TraceNode): string {
  if (isTerminalNode(node)) {
    return `"${node.value}" (Terminal/${node.type})`;
  } else {
    const nodeType = node.connection?.nodeType
      ? `, in ${node.connection?.nodeType}`
      : "";

    return `${node.variable.name} (${node.variable.defs[0]?.type}${nodeType}${
      node.connection?.type ? `/${node.connection.type}` : ""
    })`;
  }
}
