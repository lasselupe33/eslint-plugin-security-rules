import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { isParameter } from "../guards";

import { getRelevantReferences } from "./get-relevant-references";
import { HandlingContext, isTerminalNode, TraceNode } from "./types";
import { visitParameter } from "./visitors/parameter";
import { visitReference } from "./visitors/reference";

export type TraceContext = {
  context: RuleContext<string, unknown[]>;
  rootScope: Scope.Scope;
  variable?: Scope.Variable | null;
};

export function traceVariable(
  ctx: TraceContext,
  onNodeVisited: (node: TraceNode) => boolean
) {
  if (!ctx.variable) {
    return;
  }

  const remainingVariables: TraceNode[] = [
    { variable: ctx.variable, scope: ctx.rootScope },
  ];

  while (remainingVariables.length > 0) {
    const traceNode = remainingVariables.shift();

    if (!traceNode) {
      break;
    }

    onNodeVisited(traceNode);

    // We cannot continue tracing when encountering terminal nodes
    if (isTerminalNode(traceNode)) {
      continue;
    }

    const { variable, parameterToArgumentMap, scope } = traceNode;

    const handlingContext: HandlingContext = {
      ruleContext: ctx.context,
      scope,
      connection: variable,
      parameterToArgumentMap: parameterToArgumentMap ?? new Map(),
    };

    // In case we've encountered a parameter, then we cannot handle it simply be
    // tracing its references since we need to be context aware in this case.
    if (isParameter(variable.defs[0]) && parameterToArgumentMap) {
      remainingVariables.push(
        ...visitParameter(handlingContext, variable.defs[0])
      );
      continue;
    }

    for (const reference of getRelevantReferences(ctx, variable.references)) {
      remainingVariables.push(...visitReference(handlingContext, reference));
    }
  }
}
