import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { isImportSpecifier, isLiteral } from "../../../utils/ast/guards";
import { traceVariable } from "../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../utils/tracing/callbacks/with-current-trace";
import {
  isVariableNode,
  isConstantTerminalNode,
  isTerminalNode,
} from "../../../utils/tracing/types/nodes";
import { printTrace } from "../../../utils/tracing/utils/print-trace";
import { bannedAlgs } from "../node/utils/banned-algorithms";

export function isAlgorithmSafe(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  node: TSESTree.Node
): [boolean, TSESTree.Node | undefined] {
  if (!node) {
    return [true, undefined];
  }

  let maybeNode: TSESTree.Node | undefined = undefined;
  let hitImport = false;
  let isSafe = true;

  if (isLiteral(node)) {
    traceVariable(
      {
        context,
        node,
      },
      makeTraceCallbacksWithTrace({
        onNodeVisited: (trace, traceNode) => {
          const testNode = traceNode.astNodes[0];
          // If we hit an import statement, the node we return will no longer be
          // valid, as it's no longer in the linted file.
          if (testNode && isImportSpecifier(testNode)) {
            hitImport = true;
          }

          if (isVariableNode(traceNode)) {
            if (!hitImport) {
              maybeNode = traceNode?.astNodes[traceNode.astNodes.length - 1];
            }
          }
        },
        onTraceFinished: (trace) => {
          const finalNode = trace[trace.length - 1];
          printTrace(trace);

          const isTraceSafe =
            isConstantTerminalNode(finalNode) &&
            !bannedAlgs.has(finalNode.value);

          // Reset hitImport for next trace.
          hitImport = false;

          const finalAstNode =
            finalNode?.astNodes[finalNode.astNodes.length - 1];

          if (isTerminalNode(finalNode) && isLiteral(finalAstNode)) {
            maybeNode = finalAstNode;
          }
          if (!isTraceSafe) {
            isSafe = false;
            return { halt: true };
          }
        },
      })
    );
  } else {
    isSafe = true;
  }

  return [isSafe, maybeNode];
}
