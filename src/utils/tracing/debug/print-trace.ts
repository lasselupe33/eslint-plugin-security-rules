import { isTerminalNode, isVariableNode, TraceNode } from "../types";
import { TraceHandler } from "../utils/merge-trace-handlers";

/**
 * Basic utility to print the trace that our variable tracing algorithm
 * encounters.
 */
export function makeTraceDebugger(): TraceHandler {
  const currentChain: TraceNode[] = [];

  function onNodeVisited(node: TraceNode) {
    if (currentChain.length === 0) {
      currentChain.push(node);
      return false;
    }

    let prevNode = currentChain[currentChain.length - 1];

    if (isVariableNode(prevNode) && node.connection === prevNode?.variable) {
      currentChain.push(node);
    } else {
      console.warn(currentChain.map(nodeToString).join(" --> "));
      console.warn();

      prevNode = currentChain.pop();

      while (
        isTerminalNode(prevNode) ||
        node.connection !== prevNode?.variable
      ) {
        prevNode = currentChain.pop();
      }

      if (prevNode) {
        currentChain.push(prevNode);
      }

      currentChain.push(node);
    }

    return false;
  }

  function onFinished() {
    console.warn(currentChain.map(nodeToString).join(" --> "));
  }

  return [onNodeVisited, onFinished];
}

function nodeToString(node: TraceNode): string {
  if (isTerminalNode(node)) {
    return `"${node.value}" (Terminal)`;
  } else {
    return `${node.variable.name} (${node.variable.defs[0]?.type})`;
  }
}
