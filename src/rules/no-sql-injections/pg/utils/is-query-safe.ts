import { TSESTree } from "@typescript-eslint/utils";

import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../../utils/tracing/callbacks/with-current-trace";
import {
  isConstantTerminalNode,
  isNodeTerminalNode,
  isUnresolvedTerminalNode,
  isVariableNode,
} from "../../../../utils/tracing/types/nodes";
import { printTrace } from "../../../../utils/tracing/utils/print-trace";
import { HandlingContext } from "../_rule";

export function isQuerySafe(
  context: HandlingContext,
  node: TSESTree.Node
): [boolean, TSESTree.Node | undefined] {
  if (!node) {
    return [true, undefined];
  }

  let isSafe = true;
  let maybeNode: TSESTree.Node | undefined = undefined;
  // const isCurrentTraceSafelySanitzed = false;
  /**
   * Iterates through traces to determine whether or not the function has been
   * escaped.
   *
   * We check this by determining if the escape method has been called BEFORE
   * any modifications in the trace. (Since escaping may be rendered useless
   * after any modifications)
   */
  traceVariable(
    {
      context: context.ruleContext,
      node,
    },
    makeTraceCallbacksWithTrace({
      onNodeVisited: (trace, traceNode) => {
        if (isVariableNode(traceNode)) {
          maybeNode = traceNode?.astNodes[traceNode.astNodes.length - 1];
        }
      },
      onTraceFinished: (trace) => {
        printTrace(trace);
        const finalNode = trace[trace.length - 1];

        const isTraceSafe =
          isConstantTerminalNode(finalNode) ||
          isUnresolvedTerminalNode(finalNode);

        if (isNodeTerminalNode(finalNode)) {
          maybeNode = finalNode.astNode;
        }
        if (!isTraceSafe) {
          isSafe = false;
          return { halt: true };
        }
      },
    })
  );

  return [isSafe, maybeNode];
}

/*
const finalNode = trace[trace.length - 1];

        const isTraceSafe =
          isCurrentTraceSafelySanitzed || isConstantTerminalNode(finalNode);

        // Reset for next iteration
        isCurrentTraceSafelySanitzed = false;

        // If all traces are deemed safe or ends with a constant value,
        // we assume the trace to be sanitized. If any one trace is found to'
        // be unsafe, we halt further tracing.
        if (!isTraceSafe) {
          isSafe = false;
          return { halt: true };
        }

        */
