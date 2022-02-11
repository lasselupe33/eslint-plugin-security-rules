import { isTerminalNode, TraceNode } from "../types";

import { TraceHandler } from "./merge-trace-handlers";

/**
 * Basic utility to print the trace that our variable tracing algorithm
 * encounters.
 */
export function makeChainGenerator(chains: TraceNode[][]): TraceHandler {
  let currentChain: TraceNode[] = [];

  function onNodeVisited(node: TraceNode) {
    if (currentChain.length === 0) {
      currentChain.push(node);
      return false;
    }

    let prevNode = currentChain[currentChain.length - 1];

    if (!node.connection) {
      console.error("CANNOT RESOLVE CONNECTION");
      return false;
    }

    if (
      !isTerminalNode(prevNode) &&
      node.connection.variable === prevNode?.variable
    ) {
      currentChain.push(node);
    } else {
      chains.push(currentChain);

      // ...
      currentChain = [...currentChain];

      prevNode = currentChain.pop();

      while (
        isTerminalNode(prevNode) ||
        node.connection.variable !== prevNode?.variable
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
    chains.push(currentChain);
  }

  return [onNodeVisited, onFinished];
}
