import { TSESTree } from "@typescript-eslint/utils";

import {
  isArrayPattern,
  isIdentifier,
  isObjectPattern,
  isProperty,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleVariableDeclarator(
  ctx: HandlingContext,
  variableDeclarator: TSESTree.VariableDeclarator
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, variableDeclarator],
    },
  });

  // In case have encountered a form of destructuring, then ensure we preserve
  // the destructured memberPath.
  //
  // In the case of array destructing we need to find the relevant index...
  if (isArrayPattern(variableDeclarator.id)) {
    const index = variableDeclarator.id.elements.findIndex(
      (it) => isIdentifier(it) && it.name === ctx.connection.variable?.name
    );

    if (index !== -1) {
      nextCtx.meta.memberPath.push(`${index}`);
    }
  } else if (isObjectPattern(variableDeclarator.id)) {
    // ... and in the case of object destructing we need to map to the correct
    // name.
    const relevantProperty = variableDeclarator.id.properties
      .reverse()
      .find(
        (it) =>
          isIdentifier(it.value) &&
          it.value.name === ctx.connection.variable?.name
      );

    if (isProperty(relevantProperty) && isIdentifier(relevantProperty.key)) {
      nextCtx.meta.memberPath.push(relevantProperty.key.name);
    }
  }

  return handleNode(nextCtx, variableDeclarator.init);
}
