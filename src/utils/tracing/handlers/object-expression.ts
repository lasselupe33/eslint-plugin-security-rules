import { TSESTree } from "@typescript-eslint/utils";

import {
  isMethodDefinition,
  isProperty,
  isSpreadElement,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { traceVariable } from "../_trace-variable";
import { withTrace } from "../callbacks/with-trace";
import { getNodeName } from "../get-node-name";
import { HandlingContext } from "../types/context";
import {
  isNodeTerminalNode,
  isUnresolvedTerminalNode,
  makeNodeTerminalNode,
  makeUnresolvedTerminalNode,
  NodeTerminalNode,
  TraceNode,
} from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleObjectExpression(
  ctx: HandlingContext,
  objectExpression: TSESTree.ObjectExpression
): TraceNode[] {
  const { memberPath, forceFollowAllProperties } = ctx.meta;
  const astNodes = [...ctx.connection.astNodes, objectExpression];

  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes,
    },
    meta: {
      memberPath: memberPath.slice(0, -1),
    },
  });

  if (forceFollowAllProperties) {
    return objectExpression.properties
      .filter((property): property is TSESTree.Property => isProperty(property))
      .flatMap((property) => handleNode(nextCtx, property.value));
  }

  // In case we're not attempting to resolve a specific value in the objecet
  // expression, then we must simply resolve the object as a terminal
  if (memberPath.length === 0) {
    return [
      makeNodeTerminalNode({
        astNodes,
        astNode: objectExpression,
        connection: ctx.connection,
        meta: ctx.meta,
      }),
    ];
  }

  const targetProperty = memberPath[memberPath.length - 1];

  for (const property of [...objectExpression.properties].reverse()) {
    if (isProperty(property) || isMethodDefinition(property)) {
      const propertyName = getNodeName(property.key);

      if (propertyName === targetProperty) {
        return handleNode(nextCtx, property.value);
      }
    } else if (isSpreadElement(property)) {
      const objects: (NodeTerminalNode | undefined)[] = [];

      // We need to trace to the next available object and follow that in case
      // we've encountered a spread element
      traceVariable(
        {
          node: property.argument,
          context: nextCtx.ruleContext,
        },
        withTrace({
          onTraceFinished: (trace) => {
            const finalNode = trace[trace.length - 1];

            if (isNodeTerminalNode(finalNode)) {
              objects.push(finalNode);
            }
          },
        })
      );

      const matches = objects
        .filter(
          (it): it is NodeTerminalNode =>
            !!it && !nextCtx.meta.encounteredSpreadElements.has(it.astNode)
        )
        .flatMap(
          (object) =>
            handleNode(
              deepMerge(nextCtx, {
                meta: {
                  memberPath: [...nextCtx.meta.memberPath, targetProperty],
                  encounteredSpreadElements: new WeakMap([
                    [object.astNode, true],
                  ]),
                },
              }),
              object.astNode
            )
          // Remove unresolved spread nodes. These may occur since we cannot be
          // certain on which spread object our target property lives, and thus
          // we remove the spread elements that did not provide a match.
        )
        .filter((it) => !isUnresolvedTerminalNode(it));

      if (matches.length > 0) {
        return matches;
      }
    }
  }

  // We should not be able to get here, but if we do, then resolve as a
  // terminal.
  return [
    makeUnresolvedTerminalNode({
      astNodes,
      reason: "unable to follow object expression",
      connection: ctx.connection,
      meta: ctx.meta,
    }),
  ];
}
