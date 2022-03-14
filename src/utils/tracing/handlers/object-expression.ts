import { TSESTree } from "@typescript-eslint/utils";

import {
  isMethodDefinition,
  isProperty,
  isSpreadElement,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { getNodeName } from "../get-node-name";
import { HandlingContext } from "../types/context";
import {
  makeNodeTerminalNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleObjectExpression(
  ctx: HandlingContext,
  objectExpression: TSESTree.ObjectExpression
): TraceNode[] {
  const { memberPath, forceFollowObjectProperties } = ctx.meta;
  const astNodes = [...ctx.connection.astNodes, objectExpression];

  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes,
    },
  });

  if (forceFollowObjectProperties) {
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

  const targetProperty = memberPath.pop() as string;

  for (const property of objectExpression.properties.reverse()) {
    if (isProperty(property) || isMethodDefinition(property)) {
      const propertyName = getNodeName(property.key);

      if (propertyName === targetProperty) {
        return handleNode(nextCtx, property.value);
      }
    } else if (isSpreadElement(property)) {
      nextCtx.meta.memberPath.push(targetProperty);
      return handleNode(nextCtx, property.argument);
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
