import { TraceCallbacks } from "../_trace-variable";
import {
  isRootNode,
  isTerminalNode,
  makeRootNode,
  TraceNode,
} from "../types/nodes";

import { makeTraceDebugger } from "./trace-debugger";
import { Trace } from "./with-current-trace";

/**
 * Basic utility that generates all available traces found during a given
 * traceVariable() run.
 */
export function makeTraceGenerator(
  traces: Trace[],
  { printTraces }: { printTraces: boolean } = { printTraces: false }
): TraceCallbacks {
  let currentTrace: Trace = [makeRootNode()];

  function onNodeVisited(node: TraceNode) {
    let prevNode = currentTrace[currentTrace.length - 1];

    if (isRootNode(prevNode)) {
      currentTrace.push(node);
      return;
    }

    if (!node.connection) {
      console.warn("unable to resolve connection.");
    }

    // Traces always end at terminal nodes. Hence, if our previous node is a
    // terminal, then this means that we've encountered the end of a trace.

    if (
      !isTerminalNode(prevNode) &&
      node.connection?.variable === prevNode?.variable
    ) {
      currentTrace.push(node);
    } else {
      traces.push(currentTrace);

      // Shallowly clone that current trace such that we do not end up modifing
      // the existing trace, but instead create a new one.
      currentTrace = [...currentTrace];

      // Go back the trace until our new node fits the connection.
      prevNode = currentTrace.pop();

      while (
        isTerminalNode(prevNode) ||
        (!isRootNode(prevNode) &&
          node.connection?.variable !== prevNode?.variable)
      ) {
        prevNode = currentTrace.pop();
      }

      if (prevNode) {
        currentTrace.push(prevNode);
      }

      currentTrace.push(node);
    }
  }

  function onFinished() {
    traces.push(currentTrace);

    if (printTraces) {
      makeTraceDebugger(traces).onFinished?.();
    }
  }

  return { onNodeVisited, onFinished };
}
