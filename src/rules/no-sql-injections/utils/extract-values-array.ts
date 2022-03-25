import { TSESTree } from "@typescript-eslint/utils";

import { isArrayExpression } from "../../../utils/ast/guards";
import { traceVariable } from "../../../utils/tracing/_trace-variable";
import { withTrace } from "../../../utils/tracing/callbacks/with-trace";
import { isNodeTerminalNode } from "../../../utils/tracing/types/nodes";
import { HandlingContext } from "../pg/_rule";

export function extractValuesArray(
  context: HandlingContext,
  node: TSESTree.Node
): TSESTree.ArrayExpression | undefined {
  if (!node) {
    return;
  }

  let maybeNode = undefined;
  traceVariable(
    {
      context: context.ruleContext,
      node,
    },
    withTrace({
      onTraceFinished: (trace) => {
        const finalNode = trace[trace.length - 1];

        if (
          isNodeTerminalNode(finalNode) &&
          isArrayExpression(finalNode.astNode)
        ) {
          maybeNode = finalNode.astNode;
        }
      },
    })
  );

  return maybeNode;
}
