import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
  isImportDeclaration,
  isImportNamespaceSpecifier,
  isLiteral,
} from "../utils/ast/guards";
import { traceVariable } from "../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../utils/tracing/callbacks/with-current-trace";
import { isImportTerminalNode } from "../utils/tracing/types/nodes";

import { printTrace } from "./tracing/utils/print-trace";

export function getIdentifierImportModule(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  node?: TSESTree.Node
): string[] {
  const result: string[] = [];

  if (!node) {
    return result;
  }

  traceVariable(
    {
      context,
      node,
    },
    makeTraceCallbacksWithTrace({
      onTraceFinished: (trace) => {
        const finalTraceNode = trace[trace.length - 1];
        const finalASTNode =
          finalTraceNode?.astNodes[finalTraceNode.astNodes.length - 1];

        if (isImportTerminalNode(finalTraceNode)) {
          if (
            finalASTNode &&
            isImportDeclaration(finalASTNode) &&
            isLiteral(finalASTNode.source)
          ) {
            result.push(finalASTNode.source.value);
          }
        }
      },
    })
  );

  return result;
}
