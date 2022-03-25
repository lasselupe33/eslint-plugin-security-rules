import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { isImportDeclaration, isLiteral } from "../utils/ast/guards";
import { traceVariable } from "../utils/tracing/_trace-variable";
import { isImportTerminalNode } from "../utils/tracing/types/nodes";

import { withTrace } from "./tracing/callbacks/with-trace";

export function getIdentifierImportModule(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  functionName: string[],
  node?: TSESTree.Node
): [string, boolean][] {
  const result: [string, boolean][] = [];

  if (!node) {
    return result;
  }

  traceVariable(
    {
      context,
      node,
    },
    withTrace({
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
            let matchedFunction = false;
            for (const f of functionName) {
              if (finalTraceNode.imported === f) {
                matchedFunction = true;
              }
            }
            result.push([finalASTNode.source.value, matchedFunction]);
          }
        }
      },
    })
  );

  return result;
}
