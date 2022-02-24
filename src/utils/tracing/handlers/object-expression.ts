import { TSESTree } from "@typescript-eslint/utils";

import { isProperty } from "../../ast/guards";
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
  const { memberPath } = ctx.meta;
  const astNodes = [...ctx.connection.astNodes, objectExpression];

  // In case we're not attempting to resolve a specific value in the objecet
  // expression, then we must simply resolve the object as a terminal
  if (memberPath.length === 0) {
    return [
      makeNodeTerminalNode({
        astNodes,
        astNode: objectExpression,
        connection: ctx.connection,
      }),
    ];
  }

  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes,
    },
  });

  const targetProperty = memberPath.pop() as string;

  for (const property of objectExpression.properties) {
    // @TODO: handle spreadElement and function definition
    if (isProperty(property)) {
      const propertyName = getNodeName(property.key);

      if (propertyName === targetProperty) {
        return handleNode(nextCtx, property.value);
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
    }),
  ];
}
