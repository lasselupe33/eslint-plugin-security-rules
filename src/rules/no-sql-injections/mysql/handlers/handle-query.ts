import { TSESTree } from "@typescript-eslint/utils";

import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../../utils/tracing/callbacks/with-current-trace";
import {
  isVariableNode,
  isConstantTerminalNode,
} from "../../../../utils/tracing/types/nodes";
import { HandlingContext } from "../_rule";

export function handleQuery(
  ctx: HandlingContext,
  node: TSESTree.CallExpressionArgument
): boolean {
  // const foundTemplateLiteral = false;

  let isCurrentTraceSafelySanitzed = false;
  let isSafe = true;

  traceVariable(
    {
      node: node,
      context: ctx.ruleContext,
    },
    makeTraceCallbacksWithTrace({
      /* We can hit:
      /* type: constant, isterminalNode
      /* isVariableNode: true (Identifier)
      /* 
        */

      onNodeVisited: (trace, traceNode) => {
        /* 
        if (traceNode.connection?.nodeType === "TemplateLiteral") {
          foundTemplateLiteral = true;
        }

        if (!isVariableNode(traceNode)) {
          return;
        }

        if (traceNode.connection?.nodeType === "MemberExpression") {
          if (traceNode.meta.memberPath[0] === "escape") {
            isCurrentTraceSafelySanitzed = true;
            return { stopFollowingVariable: true };
          }
        }
        */
      },
      onTraceFinished: (trace) => {
        // printTrace(trace);
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
      },
    })
  );

  return isSafe;
}
