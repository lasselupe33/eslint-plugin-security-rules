import { TSESTree } from "@typescript-eslint/utils";

import { isObjectExpression } from "../../../../utils/ast/guards";
import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { withTrace } from "../../../../utils/tracing/callbacks/with-trace";
import {
  isConstantTerminalNode,
  isNodeTerminalNode,
} from "../../../../utils/tracing/types/nodes";
import { HandlingContext } from "../_rule";

/**
 * Iterates through traces to determine whether or not the function contains
 * a raw password property.
 */
export function extractPGConfig(
  context: HandlingContext,
  node: TSESTree.Node | undefined
): TSESTree.Node | undefined {
  if (!node) {
    return;
  }

  let finalAstNode: TSESTree.Node | undefined = undefined;

  traceVariable(
    {
      context: context.ruleContext,
      node,
    },
    withTrace({
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
      },
    })
  );

  return finalAstNode;
}
