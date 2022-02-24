import { TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../../utils/tracing/callbacks/with-current-trace";
import { ConnectionFlags } from "../../../../utils/tracing/types/connection";
import {
  isConstantTerminalNode,
  isImportTerminalNode,
} from "../../../../utils/tracing/types/nodes";
import { printTrace } from "../../../../utils/tracing/utils/print-trace";
import { SanitationOptions } from "../options";

type Context = {
  context: RuleContext<string, unknown[]>;
  options: SanitationOptions;
};

export function isSourceSafe(
  node: TSESTree.Node | undefined,
  { context, options }: Context
): boolean {
  if (!node) {
    return true;
  }

  let isSafe = true;
  let isCurrentTraceSafelySanitzed = false;

  /**
   * Iterates through traces to determine whether or not XSS can occur.
   *
   * We check this by determining if a sanitation method has been called BEFORE
   * any modifications in the trace. (Since sanitation is rendered useless after
   * modifications).
   *
   * Otherwise, if a trace ends in a terminal that is a constant, then
   * we assume that the string is secure since this value has been written by
   * the developer herself.
   */
  traceVariable(
    {
      context,
      node,
    },
    makeTraceCallbacksWithTrace({
      onNodeVisited: (trace, traceNode) => {
        // Once we encounter a modification connection in the current trace we
        // know that we
        if (traceNode.connection.flags.has(ConnectionFlags.MODIFICATION)) {
          const hasSanitationInTrace = trace.some((node) => {
            if (!isImportTerminalNode(node)) {
              return false;
            }

            return (
              node.source === options.sanitation.package &&
              node.imported === options.sanitation.method
            );
          });

          // We can conclude that the current trace is safe if we encounter a
          // safe function without having previously modification connections.
          isCurrentTraceSafelySanitzed = hasSanitationInTrace;
          return { stopFollowingVariable: true };
        }
      },
      onTraceFinished: (trace) => {
        printTrace(trace);

        const finalNode = trace[trace.length - 1];

        // We assume that all traces that have been explicitly deemed safe are
        // safe. Or, in the case that a trace ends with a constant value we
        // assume the trace to be safe as well (due to the belief that the
        // developer herself would not explicitly include XSS in their code).
        const isTraceSafe =
          isCurrentTraceSafelySanitzed || isConstantTerminalNode(finalNode);

        // Reset state for next trace
        isCurrentTraceSafelySanitzed = false;

        if (!isTraceSafe) {
          isSafe = false;
          return { halt: true };
        }
      },
    })
  );

  return isSafe;
}
