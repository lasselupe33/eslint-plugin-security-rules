import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { isProperty } from "../../guards";
import { getNodeName } from "../get-node-name";
import { HandlingContext, TraceNode } from "../types";

import { handleNode } from "./_handle-node";

export function handleObjectExpression(
  ctx: HandlingContext,
  objectExpression: TSESTree.ObjectExpression
): TraceNode[] {
  const { objectPath } = ctx.connection.meta;

  if (!Array.isArray(objectPath) || objectPath.length === 0) {
    return [
      {
        value: "object-expression",
        type: "variable",
        connection: ctx.connection,
      },
    ];
  }

  const nextCtx: HandlingContext = {
    ...ctx,
    connection: {
      ...ctx.connection,
      nodeType: AST_NODE_TYPES.ObjectExpression,
    },
  };

  const targetProperty = objectPath.pop() as string;

  for (const property of objectExpression.properties) {
    // @Todo handle spreadElement and function definition
    if (isProperty(property)) {
      const propertyName = getNodeName(property.key);

      if (propertyName === targetProperty) {
        return handleNode(nextCtx, property.value);
      }
    }
  }

  return [
    {
      value: "__unable to follow object expression__",
      type: "unresolved",
      connection: ctx.connection,
    },
  ];
}
