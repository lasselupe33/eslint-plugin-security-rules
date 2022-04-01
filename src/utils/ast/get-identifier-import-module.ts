import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { traceVariable } from "../tracing/_trace-variable";
import { withTrace } from "../tracing/callbacks/with-trace";
import {
  isImportTerminalNode,
  isUnresolvedTerminalNode,
} from "../tracing/types/nodes";
import { printTrace } from "../tracing/utils/print-trace";
import { getNodeModule } from "../types/get-node-module";
import { getTypeProgram } from "../types/get-type-program";

import { isImportDeclaration, isLiteral } from "./guards";

export function getIdentifierImportModule(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  functionName: string[],
  node?: TSESTree.Node
): [string, boolean][] {
  const result: [string, boolean][] = [];

  if (!node) {
    return result;
  }

  // If type information is available, use it to find the module
  const typeProgram = getTypeProgram(context);
  if (typeProgram) {
    const { modulePath, functionName: originalName } = getNodeModule(
      typeProgram,
      node
    );
    let didMatchOriginalFunctionName = false;
    for (const name of functionName) {
      if (name === originalName) {
        didMatchOriginalFunctionName = true;
      }
    }
    if (modulePath && originalName) {
      result.push([modulePath, didMatchOriginalFunctionName]);
      return result;
    }
  }

  traceVariable(
    {
      context,
      node,
    },
    withTrace({
      onTraceFinished: (trace) => {
        printTrace(trace);
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
        } else if (isUnresolvedTerminalNode(finalTraceNode)) {
          if (finalTraceNode.reason === "Unable to resolve related parameter") {
            result.push([finalTraceNode.reason, false]);
          }
        }
      },
    })
  );

  return result;
}
