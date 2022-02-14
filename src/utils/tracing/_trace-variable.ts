import { Node } from "@typescript-eslint/types/dist/ast-spec";
import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { isParameter } from "../guards";

import { getRelevantReferences } from "./get-relevant-references";
import { handleNode } from "./handlers/_handle-node";
import { HandlingContext, isTerminalNode, TraceNode } from "./types";
import { visitParameter } from "./visitors/parameter";
import { visitReference } from "./visitors/reference";

export type TraceContext = {
  context: RuleContext<string, unknown[]>;
  rootScope: Scope.Scope;
  node?: Node | null;
};

/**
 * Allows tracing a variable to its source(s) while triggering a callback for
 * every relevant node that is visited in the order of discovery.
 */
export function traceVariable(
  ctx: TraceContext,
  onNodeVisited?: (node: TraceNode) => boolean,
  onFinished?: () => void
) {
  if (!ctx.node) {
    return;
  }

  const remainingVariables = handleNode(
    {
      ruleContext: ctx.context,
      scope: ctx.rootScope,
      connection: undefined,
      parameterToArgumentMap: undefined,
    },
    ctx.node
  );

  while (remainingVariables.length > 0) {
    const traceNode = remainingVariables.shift();

    if (!traceNode || onNodeVisited?.(traceNode)) {
      break;
    }

    // We cannot continue tracing when encountering terminal nodes.
    if (isTerminalNode(traceNode)) {
      continue;
    }

    const { variable, parameterToArgumentMap, scope } = traceNode;

    const handlingContext: HandlingContext = {
      ruleContext: ctx.context,
      scope,
      connection: { variable, nodeType: undefined, type: undefined },
      parameterToArgumentMap,
    };

    // In case we've encountered a parameter, then we cannot handle it simply be
    // tracing its references since we need to be context aware in this case.
    if (isParameter(variable.defs[0]) && parameterToArgumentMap) {
      remainingVariables.unshift(
        ...visitParameter(handlingContext, variable.defs[0])
      );
      continue;
    }

    for (const reference of getRelevantReferences(variable.references)) {
      remainingVariables.unshift(...visitReference(handlingContext, reference));
    }
  }

  onFinished?.();
}
