import { TraceCallbacks } from "../_trace-variable";
import { TraceNode } from "../types/nodes";
import { printTrace } from "../utils/print-trace";

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
