import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { traceVariable } from "../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../utils/tracing/callbacks/with-current-trace";
import { isConstantTerminalNode } from "../../../utils/tracing/types/nodes";
import { printTrace } from "../../../utils/tracing/utils/print-trace";

export function isSafeValue(
  context: Readonly<TSESLint.RuleContext<string, []>>,
  node: TSESTree.Node
): boolean {
  if (!node) {
    return true;
  }

  let isSafe = true;

  traceVariable(
    {
      context,
      node,
    },
    makeTraceCallbacksWithTrace({
      onTraceFinished: (trace) => {
        // printTrace(trace);
        const finalNode = trace[trace.length - 1];

        const safeValues = /^test/;

        const isTraceSafe =
          !isConstantTerminalNode(finalNode) ||
          finalNode.value.length === 0 ||
          safeValues.test(finalNode.value);

        // If all traces are deemed safe or does not end with a constant value,
        // we assume the trace to be safe. If any one trace is found to'
        // be unsafe, we halt further tracing.
        if (!isTraceSafe) {
          isSafe = false;
          return { halt: true };
        }
      },
    })
  );

  return isSafe;
}
