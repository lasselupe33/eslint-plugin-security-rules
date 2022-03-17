import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { makeNodeTerminalNode, TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleArrayExpression(
  ctx: HandlingContext,
  arrayExpression: TSESTree.ArrayExpression
): TraceNode[] {
  const { memberPath, forceFollowObjectProperties } = ctx.meta;
  const astNodes = [...ctx.connection.astNodes, arrayExpression];

  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, arrayExpression],
    },
  });

  if (forceFollowObjectProperties) {
    return arrayExpression.elements.flatMap((elm) => handleNode(nextCtx, elm));
  }

  // In case we're not attempting to resolve a specific value in the array
  // expression, then we must simply resolve the array as a terminal
  if (memberPath.length === 0) {
    return [
      makeNodeTerminalNode({
        astNodes,
        astNode: arrayExpression,
        connection: ctx.connection,
        meta: ctx.meta,
      }),
    ];
  }

  const targetIndex = Number(memberPath.pop());

  if (arrayExpression.elements.length >= targetIndex) {
    return handleNode(nextCtx, arrayExpression.elements[targetIndex]);
  }

  // If we get here, then we have not been able to resolve which part of the
  // array is relevant. In this case we fallback to attempting to determine if
  // the whole array is safe.
  return arrayExpression.elements.flatMap((elm) => handleNode(nextCtx, elm));
}
