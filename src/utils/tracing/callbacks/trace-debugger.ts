import { TraceCallbacks } from "../_trace-variable";
import { printTrace } from "../utils/print-trace";

import { Trace } from "./with-current-trace";

/**
 * Basic utility to print the trace that our variable tracing algorithm
 * encounters.
 */
export function makeTraceDebugger(traces: Trace[]): TraceCallbacks {
  function onFinished() {
    for (const trace of traces) {
      printTrace(trace);
    }
  }

  return { onFinished };
}
