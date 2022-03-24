import { TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../../utils/tracing/callbacks/with-current-trace";
import {
  isConstantTerminalNode,
  isImportTerminalNode,
} from "../../../../utils/tracing/types/nodes";
import { printTrace } from "../../../../utils/tracing/utils/print-trace";
import { Config } from "../_rule";

type Context = {
  context: RuleContext<string, unknown[]>;
  config: Config;
};

export function isPathSafe(
  node: TSESTree.Node | undefined,
  { context }: Context
): boolean {
  if (!node) {
    return true;
  }

  let isSafe = true;

  /**
   * Iterates through traces to determine whether or not the path has been
   * safely sanitized.
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
      onTraceFinished: (trace) => {
        printTrace(trace);

        const finalNode = trace[trace.length - 1];
        const hasSanitationInTrace = trace.some((node) => {
          if (!isImportTerminalNode(node)) {
            return false;
          }

          return node.source === "sanitize-filename";
        });

        const isTraceSafe =
          isConstantTerminalNode(finalNode) || hasSanitationInTrace;

        if (!isTraceSafe) {
          isSafe = false;
          return { halt: true };
        }
      },
    })
  );

  return isSafe;
}
