import { TraceCallbacks } from "../_trace-variable";
import { isTerminalNode, TraceNode } from "../types";

/**
 * Basic utility to print the trace that our variable tracing algorithm
 * encounters.
 */
export function makeTraceDebugger(traces: TraceNode[][]): TraceCallbacks {
  function onFinished() {
    for (const trace of traces) {
      console.log(trace.map(nodeToString).join(" --> "));
      console.log();
    }
  }

  return { onFinished };
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
