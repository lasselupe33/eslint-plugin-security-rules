import { TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import { isCallExpression, isIdentifier } from "../../../../utils/ast/guards";
import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { withTrace } from "../../../../utils/tracing/callbacks/with-trace";
import { ConnectionFlags } from "../../../../utils/tracing/types/connection";
import {
  isConstantTerminalNode,
  isVariableNode,
} from "../../../../utils/tracing/types/nodes";
import { printTrace } from "../../../../utils/tracing/utils/print-trace";
import { Config } from "../_rule";

type Context = {
  context: RuleContext<string, unknown[]>;
  config: Config;
};

export function isPathSafe(
  node: TSESTree.Node | undefined,
  { context, config }: Context
): boolean {
  if (!node) {
    return true;
  }

  let isSafe = true;

  /**
   * Iterates through traces to determine whether or not the path has been
   * safely sanitized.
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
      node,
    },
    withTrace({
      onTraceFinished: (trace) => {
        printTrace(context, trace);
        const finalNode = trace[trace.length - 1];

        // Once we encounter a modification connection in the current
        // trace we know that we do not need to continue. Sanitation MUST have
        // occured before this point, which will be checked in
        // onTraceFinished.
        const modifiedAtIndex = trace.findIndex(
          (it) =>
            isVariableNode(it) &&
            it.connection.flags.has(ConnectionFlags.MODIFICATION)
        );
        const unmodifiedTrace =
          modifiedAtIndex === -1 ? trace : trace.slice(0, modifiedAtIndex);

        const hasSanitationBeforeModification = unmodifiedTrace.some((node) => {
          for (const astNode of node.astNodes) {
            if (
              isCallExpression(astNode) &&
              isIdentifier(astNode.callee) &&
              astNode.callee.name === config.sanitation.method
            ) {
              return true;
            }
          }

          return false;
        });

        const isTraceSafe =
          isConstantTerminalNode(finalNode) || hasSanitationBeforeModification;

        if (!isTraceSafe) {
          isSafe = false;
          return { halt: true };
        }
      },
    })
  );

  return isSafe;
}
