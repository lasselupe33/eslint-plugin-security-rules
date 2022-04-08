import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { isImportSpecifier, isLiteral } from "../../../utils/ast/guards";
import { traceVariable } from "../../../utils/tracing/_trace-variable";
import { withTrace } from "../../../utils/tracing/callbacks/with-trace";
import {
  isVariableNode,
  isConstantTerminalNode,
  isTerminalNode,
} from "../../../utils/tracing/types/nodes";
import { bannedAlgs } from "../node/utils/banned-algorithms";

type ReturnType = {
  isSafe: boolean;
  troubleNode?: TSESTree.Node;
};

export function isAlgorithmSafe(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  node: TSESTree.Node
): ReturnType {
  if (!node || isLiteral(node)) {
    return {
      isSafe: !bannedAlgs.has(String(node.value).toUpperCase()),
      troubleNode: node,
    };
  }

  let maybeNode: TSESTree.Node | undefined = undefined;
  let hitImport = false;
  let isSafe = true;

  traceVariable(
    {
      context,
      node,
    },
    withTrace({
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

        const isTraceSafe =
          isConstantTerminalNode(finalNode) &&
          !bannedAlgs.has(finalNode.value.toUpperCase());

        // Reset hitImport for next trace.
        hitImport = false;

        const finalAstNode = finalNode?.astNodes[finalNode.astNodes.length - 1];

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

  return { isSafe, troubleNode: maybeNode };
}
