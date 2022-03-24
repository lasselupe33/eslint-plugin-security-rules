import { TSESTree } from "@typescript-eslint/utils";
import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import {
  isClassName,
  isFunctionName,
  isImportBinding,
  isParameter,
} from "../ast/guards";
import { getModuleScope } from "../get-module-scope";

import { getRelevantReferences } from "./get-relevant-references";
import { handleNode } from "./handlers/_handle-node";
import { HandlingContext } from "./types/context";
import {
  isTerminalNode,
  isVariableNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "./types/nodes";
import { isCycle } from "./utils/is-cycle";
import { visitClassName } from "./visitors/class-name";
import { visitFunctionName } from "./visitors/function-name";
import { visitImportBinding } from "./visitors/import-binding";
import { visitParameter } from "./visitors/parameter";
import { visitReference } from "./visitors/reference";

export type TraceContext = {
  context: RuleContext<string, unknown[]>;
  initialScope?: Scope.Scope;
  node?: TSESTree.Node | null | undefined;
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
  const encounteredMap: WeakMap<Scope.Variable, number> = new WeakMap();

  // Bootstrap the tracing queue by handling the node passed by the integration.
  const remainingVariables = handleNode(
    {
      ruleContext: ctx.context,
      rootScope: getModuleScope(ctx.context.getScope()),
      scope: ctx.initialScope ?? ctx.context.getScope(),
      connection: {
        astNodes: [],
        flags: new Set(),
        prevConnection: undefined,
      },
      meta: {
        filePath:
          ctx.context.getPhysicalFilename?.() ?? ctx.context.getFilename(),
        parserPath: ctx.context.parserPath,
        memberPath: [],
        parameterContext: new WeakMap(),
        callCount: 0,
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

    const {
      variable,
      meta,
      scope,
      rootScope,
      connection: prevConnection,
    } = traceNode;

    const handlingContext: HandlingContext = {
      ruleContext: ctx.context,
      scope,
      rootScope,
      connection: {
        variable,
        astNodes: [],
        flags: new Set(),
        prevConnection,
      },
      meta,
    };

    if (isCycle(encounteredMap, handlingContext.connection)) {
      onNodeVisited?.(
        makeUnresolvedTerminalNode({
          reason: "Encountered cycle",
          connection: handlingContext.connection,
          astNodes: [],
          meta,
        })
      );
      continue;
    }

    // In case we've encountered a parameter, then we cannot handle it simply be
    // tracing its references since we need to be context aware in this case.
    if (isParameter(variable.defs[0])) {
      remainingVariables.unshift(
        ...visitParameter(handlingContext, variable.defs[0])
      );
      continue;
    }

    if (isFunctionName(variable.defs[0])) {
      remainingVariables.unshift(
        ...visitFunctionName(handlingContext, variable.defs[0])
      );
      continue;
    }

    if (isClassName(variable.defs[0])) {
      remainingVariables.unshift(
        ...visitClassName(handlingContext, variable.defs[0])
      );
    }

    // In case we encounter an import binding, then we simply need to propagate
    // its correct node.
    if (isImportBinding(variable.defs[0])) {
      remainingVariables.unshift(
        ...visitImportBinding(handlingContext, variable, variable.defs[0])
      );
      continue;
    }

    for (const reference of getRelevantReferences(variable.references)) {
      remainingVariables.unshift(...visitReference(handlingContext, reference));
    }
  }

  onFinished?.();
}
