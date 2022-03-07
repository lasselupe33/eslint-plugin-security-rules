import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import {
  isArrayExpression,
  isIdentifier,
  isMemberExpression,
  isSpreadElement,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { traceVariable } from "../_trace-variable";
import { makeTraceCallbacksWithTrace } from "../callbacks/with-current-trace";
import { HandlingContext } from "../types/context";
import {
  isConstantTerminalNode,
  isNodeTerminalNode,
  NodeTerminalNode,
  TraceNode,
} from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleCallExpression(
  ctx: HandlingContext,
  callExpression: TSESTree.CallExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, callExpression],
    },
  });

  // In case our callExpression is on a memberExpression, then we might possible
  // need to apply overrides.
  if (isMemberExpression(callExpression.callee)) {
    let calledOn: NodeTerminalNode | undefined;

    traceVariable(
      { node: callExpression.callee.object, context: ctx.ruleContext },
      makeTraceCallbacksWithTrace({
        onTraceFinished: (trace) => {
          const finalNode = trace[trace.length - 1];
          if (isNodeTerminalNode(finalNode)) {
            calledOn = finalNode;
            return { halt: true };
          }
        },
      })
    );

    if (isNodeTerminalNode(calledOn)) {
      const overrides = handleOverrides(nextCtx, callExpression, calledOn);

      // In case overrides (of e.g. native API's such as arr.join()) has been
      // supplied, then we return these immediately.
      if (overrides) {
        return overrides;
      }
    }
  }

  const calleeIdentifier = handleNode(
    deepMerge(nextCtx, { meta: { forceIdentifierLiteral: true } }),
    callExpression.callee
  )[0];

  if (isConstantTerminalNode(calleeIdentifier)) {
    if (!nextCtx.meta.activeArguments[calleeIdentifier.value]) {
      nextCtx.meta.activeArguments[calleeIdentifier.value] = [];
    }

    nextCtx.meta.activeArguments[calleeIdentifier.value]?.push(
      callExpression.arguments.map((arg) => ({
        argument: arg,
        scope: getInnermostScope(ctx.scope, callExpression),
      }))
    );
  }

  return handleNode(nextCtx, callExpression.callee);
}

/**
 * Helper to determine if the current call should result in a custom override.
 *
 * Overrides can be useful to handle naitve JS API's such as arr.join() which
 * alters the default way we need to follow variables.
 */
function handleOverrides(
  ctx: HandlingContext,
  callExpression: TSESTree.CallExpression,
  calledOn: NodeTerminalNode
): TraceNode[] | undefined {
  if (
    isArrayExpression(calledOn.astNode) &&
    isMemberExpression(callExpression.callee) &&
    isIdentifier(callExpression.callee.property)
  ) {
    switch (callExpression.callee.property.name) {
      case "join":
        return handleNode(
          deepMerge(ctx, {
            meta: { forceFollowObjectProperties: true },
          }),
          callExpression.callee.object
        );

      case "concat":
        return [
          ...handleNode(ctx, callExpression.callee.object),
          ...callExpression.arguments
            .flatMap((arg) => {
              if (!isSpreadElement(arg)) {
                return handleNode(ctx, arg);
              }
            })
            .filter((it): it is TraceNode => !!it),
        ];
    }
  }
}
