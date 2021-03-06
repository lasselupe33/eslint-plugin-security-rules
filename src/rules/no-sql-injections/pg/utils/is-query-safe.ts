import { TSESTree } from "@typescript-eslint/utils";

import { isImportSpecifier } from "../../../../utils/ast/guards";
import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { withTrace } from "../../../../utils/tracing/callbacks/with-trace";
import {
  isConstantTerminalNode,
  isNodeTerminalNode,
  isVariableNode,
} from "../../../../utils/tracing/types/nodes";
import { printTrace } from "../../../../utils/tracing/utils/print-trace";
import { HandlingContext } from "../_rule";

/**
 * @returns {Array} boolean of whether the query is safe and the last node
 * variable that caused the issue
 */
export function isQuerySafe(
  context: HandlingContext,
  node: TSESTree.Node
): [boolean, TSESTree.Node | undefined, string] {
  if (!node) {
    return [true, undefined, ""];
  }

  let isSafe = true;
  let maybeNode: TSESTree.Node | undefined = undefined;
  let hitImport = false;
  let maybeQuery = "";
  // const isCurrentTraceSafelySanitzed = false;
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
      node,
    },
    withTrace({
      onNodeVisited: (trace, traceNode) => {
        // In case the trace is no longer deemed safe, we run the entire trace
        // to get the entire query for the automatic fix.
        if (isSafe) {
          const testNode = traceNode.astNodes[0];
          // If we hit an import statement, the node we return will no longer be
          // valid, as it's no longer in the linted file.
          if (testNode && isImportSpecifier(testNode)) {
            hitImport = true;
          }
          if (
            !hitImport &&
            isVariableNode(traceNode) &&
            traceNode.variable.defs.length > 0
          ) {
            maybeNode = traceNode?.astNodes[traceNode.astNodes.length - 1];
          }
        }
      },
      onTraceFinished: (trace) => {
        if (isSafe) {
          const finalNode = trace[trace.length - 1];

          const isTraceSafe = isConstantTerminalNode(finalNode);

          // Reset hitImport for next trace.
          hitImport = false;

          if (isNodeTerminalNode(finalNode)) {
            maybeNode = finalNode.astNode;
          }
          if (!isTraceSafe) {
            isSafe = false;
            // return { halt: true };
          }
        }
      },
      onFinished: (terminalGroups) => {
        // We handle only one terminal group, as a query as often terminates in
        // a single use-case. If a query has the form:
        //
        // let query = "query a"
        // if (bool) { query = "query b"}
        //
        // We'd argue that the programmer has code smell and we therefore don't
        // handle this case for now.
        const terminals = terminalGroups[0];
        terminals?.map((terminal) => {
          if (isConstantTerminalNode(terminal)) {
            maybeQuery += terminal.value;
          }
        });
      },
    })
  );

  return [isSafe, maybeNode, maybeQuery];
}
