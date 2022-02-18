import { TraceCallbacks } from "../_trace-variable";
import { TraceNode } from "../types/nodes";

export function mergeTraceHandlers(
  ...handlers: TraceCallbacks[]
): TraceCallbacks {
  const onNodeVisited = (node: TraceNode) =>
    handlers
      .map((handler) => handler.onNodeVisited?.(node))
      .reduce((acc, curr) => ({
        stopFollowingVariable:
          (acc?.stopFollowingVariable ?? false) ||
          (curr?.stopFollowingVariable ?? false),
        halt: (acc?.halt ?? false) || (curr?.halt ?? false),
      }));

  const onFinished = () => {
    handlers.map((handler) => handler.onFinished?.());
  };

  return { onNodeVisited, onFinished };
}
