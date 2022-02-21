import { isPrimitive } from "../../ast/guards";
import {
  isConstantTerminalNode,
  isNodeTerminalNode,
  isUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";

export function printTrace(trace: TraceNode[]): void {
  console.warn(trace.map(nodeToString).join(" --> "));
  console.warn();
}

function nodeToString(node: TraceNode): string {
  if (isConstantTerminalNode(node)) {
    return `"${
      isPrimitive(node.value) ? String(node.value) : JSON.stringify(node.value)
    }" (Terminal/${node.type})`;
  } else if (isUnresolvedTerminalNode(node)) {
    return `"${node.reason}" (Terminal/${node.type})`;
  } else if (isNodeTerminalNode(node)) {
    return `"${node.nodeType}" (Terminal/${node.type})`;
  } else {
    const nodeType = node.connection?.nodeType
      ? `, in ${node.connection?.nodeType}`
      : "";

    return `${node.variable.name} (${
      node.variable.defs[0]?.type ?? ""
    }${nodeType}${node.connection?.type ? `/${node.connection.type}` : ""})`;
  }
}
