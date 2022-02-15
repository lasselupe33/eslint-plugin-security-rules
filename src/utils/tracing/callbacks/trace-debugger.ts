import { TraceCallbacks } from "../_trace-variable";
import { TraceNode } from "../types";
import { printTrace } from "../utils/printTrace";

/**
 * Basic utility to print the trace that our variable tracing algorithm
 * encounters.
 */
export function makeTraceDebugger(traces: TraceNode[][]): TraceCallbacks {
  function onFinished() {
    for (const trace of traces) {
      printTrace(trace);
    }
  }

  return { onFinished };
}
