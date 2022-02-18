import { TraceCallbacks } from "../_trace-variable";
import { isTerminalNode, TraceNode } from "../types/nodes";

type TraceCallbacksWithCurrentTrace = {
  onNodeVisited?: (
    trace: TraceNode[],
    ...args: Parameters<Required<TraceCallbacks>["onNodeVisited"]>
  ) => ReturnType<Required<TraceCallbacks>["onNodeVisited"]>;
  onTraceFinished?: (
    trace: TraceNode[]
  ) => ReturnType<Required<TraceCallbacks>["onNodeVisited"]>;
  onFinished?: (
    trace: TraceNode[],
    ...args: Parameters<Required<TraceCallbacks>["onFinished"]>
  ) => ReturnType<Required<TraceCallbacks>["onFinished"]>;
};

/**
 * This helper allows integrations of trace callbacks to obtain an additional
 * parameter which will contain all of the current trace when onNodeVisited()
 * is called.
 *
 * Furthermore an additional function, onTraceFinished(), is added, which will
 * be called every time the current trace reaches its end.
 */
export function makeTraceCallbacksWithTrace(
  callbacks: TraceCallbacksWithCurrentTrace
): TraceCallbacks {
  const currentTrace: TraceNode[] = [];

  function onNodeVisited(node: TraceNode) {
    let toReturn = callbacks.onNodeVisited?.(currentTrace, node);

    if (currentTrace.length === 0) {
      currentTrace.push(node);
      return toReturn;
    }

    let prevNode = currentTrace[currentTrace.length - 1];

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
      toReturn = callbacks.onTraceFinished?.(currentTrace);

      // Go back the trace until our new node fits the connection.
      prevNode = currentTrace.pop();

      while (
        currentTrace.length > 0 &&
        (isTerminalNode(prevNode) ||
          node.connection?.variable !== prevNode?.variable)
      ) {
        prevNode = currentTrace.pop();
      }

      if (prevNode) {
        currentTrace.push(prevNode);
      }

      currentTrace.push(node);
    }

    return toReturn;
  }

  function onFinished() {
    callbacks.onTraceFinished?.(currentTrace);
    callbacks.onFinished?.(currentTrace);
  }

  return { onNodeVisited, onFinished };
}
