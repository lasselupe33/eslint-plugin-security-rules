import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { traceVariable } from "../tracing/_trace-variable";
import { withTrace } from "../tracing/callbacks/with-trace";
import {
  isImportTerminalNode,
  isUnresolvedTerminalNode,
} from "../tracing/types/nodes";
import { getNodeModule } from "../types/get-node-module";
import { getTypeProgram } from "../types/get-type-program";

import { isCallExpression, isImportDeclaration, isLiteral } from "./guards";

type ReturnType = Array<{
  pathOrImport?: string;
  didMatchFunctionName: boolean;
}>;

export function getIdentifierImportModule(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  functionName: string[],
  node?: TSESTree.Node
): ReturnType {
  const result: ReturnType = [];

  if (!node) {
    return result;
  }

  // If type information is available, use it to find the module
  const typeProgram = getTypeProgram(context);
  if (typeProgram) {
    const { modulePath, functionName: originalName } = getNodeModule(
      typeProgram,
      isCallExpression(node) ? node.callee : node
    );

    const didMatchOriginalFunctionName = functionName.some(
      (name) => name === originalName
    );

    if (modulePath && originalName) {
      result.push({
        pathOrImport: modulePath,
        didMatchFunctionName: didMatchOriginalFunctionName,
      });
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
        const finalTraceNode = trace[trace.length - 1];
        const finalASTNode =
          finalTraceNode?.astNodes[finalTraceNode.astNodes.length - 1];

        if (isImportTerminalNode(finalTraceNode)) {
          if (
            finalASTNode &&
            isImportDeclaration(finalASTNode) &&
            isLiteral(finalASTNode.source)
          ) {
            const matchedFunction = functionName.some(
              (name) => name === finalTraceNode.imported
            );

            result.push({
              pathOrImport: finalASTNode.source.value,
              didMatchFunctionName: matchedFunction,
            });
          }
        } else if (isUnresolvedTerminalNode(finalTraceNode)) {
          if (finalTraceNode.kind === "parameter") {
            // Returning didMatchFunctioName as false to avoid an abundance of
            // false positives.
            result.push({
              pathOrImport: undefined,
              didMatchFunctionName: false,
            });
          }
        }
      },
    })
  );

  return result;
}
