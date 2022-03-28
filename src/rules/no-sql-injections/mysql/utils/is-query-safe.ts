import { TSESTree } from "@typescript-eslint/utils";
import { isIdentifier } from "@typescript-eslint/utils/dist/ast-utils";

import {
  isImportSpecifier,
  isMemberExpression,
  isNode,
  isObjectExpression,
  isProperty,
} from "../../../../utils/ast/guards";
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
  let isCurrentTraceSafe = false;
  let maybeNode: unknown | TSESTree.Node | undefined = undefined;
  let hitImport = false;
  let maybeQuery = "";

  traceVariable(
    {
      context: context.ruleContext,
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

        for (const node of traceNode.astNodes) {
          if (
            isMemberExpression(node) &&
            isIdentifier(node.property) &&
            (node.property.name === "escape" ||
              node.property.name === "escapeId")
          ) {
            isCurrentTraceSafe = true;
            return { stopFollowingVariable: true };
          }
        }

        if (isVariableNode(traceNode)) {
          if (!hitImport) {
            maybeNode = traceNode?.astNodes[traceNode.astNodes.length - 1];
          }
        }
      },
      onTraceFinished: (trace) => {
        const finalNode = trace[trace.length - 1];
        // printTrace(trace);

        const isTraceSafe =
          isConstantTerminalNode(finalNode) || isCurrentTraceSafe;

        // Reset hitImport and isCurrentTraceSafe for next trace.
        hitImport = false;
        isCurrentTraceSafe = false;

        if (isNodeTerminalNode(finalNode)) {
          maybeNode = finalNode.astNode;
        }
        if (!isTraceSafe) {
          isSafe = false;
          return { halt: true };
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

  if (isObjectExpression(maybeNode)) {
    for (const property of maybeNode.properties) {
      if (
        isProperty(property) &&
        isIdentifier(property.key) &&
        property.key.name === "sql"
      ) {
        return isQuerySafe(context, property.value);
      }
    }
  }

  // Typescript is stupid and doesn't recognize the type of maybeNode :(!
  if (isNode(maybeNode)) {
    return [isSafe, maybeNode, maybeQuery];
  } else {
    return [isSafe, undefined, maybeQuery];
  }
}
