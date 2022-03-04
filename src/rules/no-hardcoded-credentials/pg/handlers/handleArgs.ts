import { TSESTree } from "@typescript-eslint/utils";

import { isObjectExpression } from "../../../../utils/ast/guards";
import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../../utils/tracing/callbacks/with-current-trace";
import {
  isConstantTerminalNode,
  isNodeTerminalNode,
} from "../../../../utils/tracing/types/nodes";
import { printTrace } from "../../../../utils/tracing/utils/print-trace";
import { HandlingContext } from "../_rule";

export function handleArgs(
  context: HandlingContext,
  node: TSESTree.Node | undefined
): TSESTree.Node | undefined {
  if (!node) {
    return;
  }

  let finalAstNode: TSESTree.Node | undefined = undefined;
  /**
   * Iterates through traces to determine whether or not the function contains
   * a raw password property.
   */
  traceVariable(
    {
      context: context.ruleContext,
      node,
    },
    makeTraceCallbacksWithTrace({
      onTraceFinished: (trace) => {
        const finalTraceNode = trace[trace.length - 1];

        if (isConstantTerminalNode(finalTraceNode)) {
          finalAstNode =
            finalTraceNode?.astNodes[finalTraceNode.astNodes.length - 1];
        } else if (isNodeTerminalNode(finalTraceNode)) {
          if (isObjectExpression(finalTraceNode.astNode)) {
            finalAstNode = finalTraceNode.astNode;
          }
        }

        printTrace(trace);
      },
    })
  );

  return finalAstNode;
}
