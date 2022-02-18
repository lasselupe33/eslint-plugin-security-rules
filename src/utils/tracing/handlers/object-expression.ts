import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { isProperty } from "../../guards";
import { getNodeName } from "../get-node-name";
import { HandlingContext, TraceNode } from "../types";

import { handleNode } from "./_handle-node";

export function handleObjectExpression(
  ctx: HandlingContext,
  objectExpression: TSESTree.ObjectExpression
): TraceNode[] {
  const { memberPath } = ctx.meta;

  // In case we're not attempting to resolve a specific value in the objecet
  // expression, then we must simply resolve the object as a terminal
  if (memberPath.length === 0) {
    return [
      {
        value: "object-expression",
        type: "variable",
        connection: ctx.connection,
      },
    ];
  }

  const nextCtx = deepMerge(ctx, {
    connection: {
      nodeType: AST_NODE_TYPES.ObjectExpression,
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
    {
      value: "__unable to follow object expression__",
      type: "unresolved",
      connection: ctx.connection,
    },
  ];
}
