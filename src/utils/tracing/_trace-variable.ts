import { Node } from "@typescript-eslint/types/dist/ast-spec";
import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { isImportBinding, isParameter } from "../ast/guards";

import { getRelevantReferences } from "./get-relevant-references";
import { handleNode } from "./handlers/_handle-node";
import { HandlingContext } from "./types/context";
import { isTerminalNode, isVariableNode, TraceNode } from "./types/nodes";
import { visitParameter } from "./visitors/parameter";
import { visitReference } from "./visitors/reference";

export type TraceContext = {
  context: RuleContext<string, unknown[]>;
  rootScope: Scope.Scope;
  node?: Node | null | undefined;
};

export type TraceCallbacks = {
  onNodeVisited?: (
    node: TraceNode
  ) => { stopFollowingVariable?: boolean; halt?: boolean } | void;
  onFinished?: () => void | undefined;
};

/**
 * Allows tracing a variable to its source(s) while triggering a callback for
 * every relevant node that is visited in the order of discovery.
 */
export function traceVariable(
  ctx: TraceContext,
  { onNodeVisited, onFinished }: TraceCallbacks = {}
) {
  if (!ctx.node) {
    return;
  }

  const abortedMap: WeakMap<Scope.Variable, boolean> = new WeakMap();
  const encounteredMap: WeakMap<Scope.Variable, boolean> = new WeakMap();

  // Bootstrap the tracing queue by handling the node passed by the integration.
  const remainingVariables = handleNode(
    {
      ruleContext: ctx.context,
      scope: ctx.rootScope,
      connection: {},
      meta: {
        parameterToArgumentMap: undefined,
        memberPath: [],
      },
    },
    ctx.node
  );

  while (remainingVariables.length > 0) {
    const traceNode = remainingVariables.shift();

    if (!traceNode) {
      break;
    }

    // In case we've aborted traversal to the connection of the current trace
    // node, then we should not be checking it since the trace has already been
    // terminated by the integration.
    if (
      traceNode.connection?.variable &&
      abortedMap.has(traceNode.connection.variable)
    ) {
      continue;
    }

    const visitRes = onNodeVisited?.(traceNode);

    if (visitRes?.halt) {
      break;
    }

    // We cannot continue tracing when encountering terminal nodes, or if the
    // integration has requested that the current trace is aborted.
    if (isTerminalNode(traceNode) || visitRes?.stopFollowingVariable) {
      // In case the traceNode is a variable node, then add the variable to the
      // abortedMap which will allow us to skip any other nodes in the queue
      // that is connected to the trace that should be aborted.
      if (isVariableNode(traceNode)) {
        abortedMap.set(traceNode.variable, true);
      }

      continue;
    }

    const { variable, meta, scope } = traceNode;

    if (encounteredMap.has(variable)) {
      console.error("traceVariable(): Encountered cycle, skipping");
      continue;
    }

    encounteredMap.set(variable, true);

    const handlingContext: HandlingContext = {
      ruleContext: ctx.context,
      scope,
      connection: {
        variable,
        nodeType: undefined,
        type: undefined,
      },
      meta,
    };

    // In case we've encountered a parameter, then we cannot handle it simply be
    // tracing its references since we need to be context aware in this case.
    if (isParameter(variable.defs[0]) && meta.parameterToArgumentMap) {
      remainingVariables.unshift(
        ...visitParameter(handlingContext, variable.defs[0])
      );
      continue;
    }

    // In case we encounter an import binding, then we simply need to propagate
    // its correct node.
    if (isImportBinding(variable.defs[0])) {
      remainingVariables.unshift(
        ...handleNode(handlingContext, variable.defs[0].node)
      );
      continue;
    }

    for (const reference of getRelevantReferences(variable.references)) {
      remainingVariables.unshift(...visitReference(handlingContext, reference));
    }
  }

  onFinished?.();
}
