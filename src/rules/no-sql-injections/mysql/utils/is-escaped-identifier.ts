import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import {
  isIdentifier,
  isMemberExpression,
  isVariableDeclarator,
} from "../../../../utils/ast/guards";
import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../../utils/tracing/callbacks/with-current-trace";
import { isConstantTerminalNode } from "../../../../utils/tracing/types/nodes";
import { printTrace } from "../../../../utils/tracing/utils/print-trace";
import { HandlingContext } from "../_rule";

export function isSourceEscaped(
  context: HandlingContext,
  node: TSESTree.Node | undefined
): boolean {
  if (!node) {
    return true;
  }

  let isSafe = true;
  let isCurrentTraceSafelySanitzed = false;
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
      rootScope: getInnermostScope(context.ruleContext.getScope(), node),
      node,
    },
    makeTraceCallbacksWithTrace({
      onNodeVisited: (trace, traceNode) => {
        if (!isVariableDeclarator(traceNode.astNodes[0])) {
          return;
        }

        for (let i = 1; i < traceNode.astNodes.length; i++) {
          const node = traceNode.astNodes[i];
          if (isMemberExpression(node) && isIdentifier(node.property)) {
            if (
              node.property.name === "escape" ||
              node.property.name === "escapeId"
            ) {
              isCurrentTraceSafelySanitzed = true;
              return { stopFollowingVariable: true };
            }
          }
        }
      },
      onTraceFinished: (trace) => {
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
