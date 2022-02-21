import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import { getImportMeta } from "../../../../utils/ast/get-import-meta";
import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../../utils/tracing/callbacks/with-current-trace";
import { ConnectionTypes } from "../../../../utils/tracing/types/connection";
import {
  isNodeTerminalNode,
  isTerminalNode,
} from "../../../../utils/tracing/types/nodes";
import { printTrace } from "../../../../utils/tracing/utils/printTrace";
import { SanitationOptions } from "../_rule";

type Context = {
  context: RuleContext<string, unknown[]>;
  options: SanitationOptions;
};

export function isSourceSafe(
  node: TSESTree.Node | undefined,
  { context, options }: Context
): boolean {
  if (!node) {
    return true;
  }

  let isSafe = true;
  let isCurrentTraceSafelySanitzed = false;

  /**
   * Iterates through traces to determine whether or not XSS can occur.
   *
   * We check this by determining if a sanitation method has been called BEFORE
   * any modifications in the trace. (Since sanitation is rendered useless after
   * modifications).
   *
   * Otherwise, if a trace ends in a terminal that is a constant, then
   * we assume that the string is secure since this value has been written by
   * the developer herself.
   */
  traceVariable(
    {
      context,
      rootScope: getInnermostScope(context.getScope(), node),
      node,
    },
    makeTraceCallbacksWithTrace({
      onNodeVisited: (trace, traceNode) => {
        if (isNodeTerminalNode(traceNode)) {
          const importMeta = getImportMeta(traceNode.node);

          // In case we cannot resolve import data from the terminal node, then
          // we will not have encountered a sanitation terminal, since
          // sanitsation methods will always have to be imported!
          if (
            !importMeta ||
            importMeta.source !== options.sanitation.package ||
            importMeta.imported !== options.sanitation.method
          ) {
            return;
          }

          const hasModificationInTrace = trace.some(
            (node) => node.connection?.type === ConnectionTypes.MODIFICATION
          );

          // We can conclude that the current trace is safe if we encounter a
          // safe function without having previously modification connections.
          if (!hasModificationInTrace) {
            isCurrentTraceSafelySanitzed = true;
            return { stopFollowingVariable: true };
          }
        }
      },
      onTraceFinished: (trace) => {
        printTrace(trace);

        const finalNode = trace[trace.length - 1];
        const isTraceSafe =
          isCurrentTraceSafelySanitzed ||
          (isTerminalNode(finalNode) && finalNode.type !== "unresolved");

        // Reset state for next trace
        isCurrentTraceSafelySanitzed = false;

        if (!isTraceSafe) {
          isSafe = false;
          return { halt: true };
        }
      },
    })
  );

  return isSafe;
}
