import { TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { withTrace } from "../../../../utils/tracing/callbacks/with-trace";
import { ConnectionFlags } from "../../../../utils/tracing/types/connection";
import {
  isConstantTerminalNode,
  isGlobalTerminalNode,
  isImportTerminalNode,
  isNodeTerminalNode,
  isVariableNode,
} from "../../../../utils/tracing/types/nodes";
import { printTrace } from "../../../../utils/tracing/utils/print-trace";
import { SanitationOptions } from "../options";
import { SinkTypes } from "../sink/types";

type Context = {
  context: RuleContext<string, unknown[]>;
  options: SanitationOptions;
  sinkType: SinkTypes;
};

export function isSourceSafe(
  node: TSESTree.Node | undefined,
  { context, options, sinkType }: Context
): boolean {
  if (!node) {
    return true;
  }

  let isSafe = true;

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
    withTrace({
      onTraceFinished: (trace) => {
        printTrace(context, trace);

        const finalNode = trace[trace.length - 1];

        // Once we encounter a modification connection in the current
        // trace we know that we do not need to continue. Sanitation MUST have
        // occured before this point, which will be checked in
        // onTraceFinished.
        const modifiedAtIndex = trace.findIndex(
          (it) =>
            isVariableNode(it) &&
            it.connection.flags.has(ConnectionFlags.MODIFICATION)
        );
        const unmodifiedTrace =
          modifiedAtIndex === -1 ? trace : trace.slice(0, modifiedAtIndex);

        const hasSanitationInTrace = unmodifiedTrace.some((node) => {
          if (!isImportTerminalNode(node)) {
            return false;
          }

          return (
            node.source === options.sanitation.package &&
            node.imported === options.sanitation.method
          );
        });

        // We assume that all traces that have been explicitly deemed safe are
        // safe. Or, in the case that a trace ends with a constant value we
        // assume the trace to be safe as well (due to the assumption that the
        // developer herself would not explicitly include XSS in their code).
        //
        // However, for execution sinks, only string inputs should be considered
        // harmful, but functions and other nodes should be allowed.
        const isTraceSafe =
          hasSanitationInTrace ||
          isConstantTerminalNode(finalNode) ||
          (sinkType === SinkTypes.EXECUTION &&
            (isNodeTerminalNode(finalNode) || isGlobalTerminalNode(finalNode)));

        if (!isTraceSafe) {
          isSafe = false;
          return { halt: true };
        }
      },
    })
  );

  return isSafe;
}
