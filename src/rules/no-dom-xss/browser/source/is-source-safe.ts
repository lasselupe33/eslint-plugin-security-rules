import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import {
  ConnectionTypes,
  isTerminalNode,
  isVariableNode,
  TraceNode,
} from "../../../../utils/tracing/types";
import { makeTraceGenerator } from "../../../../utils/tracing/utils/generate-traces";
import { mergeTraceHandlers } from "../../../../utils/tracing/utils/merge-trace-handlers";

type Context = {
  context: RuleContext<string, unknown[]>;
};

export function isSourceSafe(
  node: TSESTree.Node | undefined,
  { context }: Context
): boolean {
  if (!node) {
    return true;
  }

  const traces: TraceNode[][] = [];

  traceVariable(
    {
      context,
      rootScope: getInnermostScope(context.getScope(), node),
      node,
    },
    ...mergeTraceHandlers(/* makeTraceDebugger(),*/ makeTraceGenerator(traces))
  );

  const isSafe = traces.every(isTraceSafe);

  return isSafe;
}

const SAFE_FUNCTIONS_NAMES = ["safe"];

/**
 * Iterates through a trace to determine whether or not XSS can occur inside it.
 *
 * We check this by determining if a sanitation method has been called BEFORE
 * any modifications in the trace. (Since sanitation is rendered useless after
 * modifications).
 *
 * Otherwise, if a trace ends in a terminal - i.e. a constant variable, then we
 * assume that the string is secure since it is written by the developer herself
 */
function isTraceSafe(trace: TraceNode[]): boolean {
  let isSafelySanitized = false;

  for (const node of trace) {
    if (node.connection?.type === ConnectionTypes.MODIFICATION) {
      break;
    }

    if (
      isVariableNode(node) &&
      SAFE_FUNCTIONS_NAMES.includes(node.variable.name)
    ) {
      isSafelySanitized = true;
      break;
    }
  }

  const finalNode = trace[trace.length - 1];

  return (
    isSafelySanitized ||
    (isTerminalNode(finalNode) && finalNode.value !== "__undefined__")
  );
}
