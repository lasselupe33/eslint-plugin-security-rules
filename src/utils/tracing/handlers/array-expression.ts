import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import {
  makeNodeTerminalNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleArrayExpression(
  ctx: HandlingContext,
  arrayExpression: TSESTree.ArrayExpression
): TraceNode[] {
  const { memberPath } = ctx.meta;
  const astNodes = [...ctx.connection.astNodes, arrayExpression];

  // In case we're not attempting to resolve a specific value in the array
  // expression, then we must simply resolve the array as a terminal
  if (memberPath.length === 0) {
    return [
      makeNodeTerminalNode({
        astNodes,
        astNode: arrayExpression,
        connection: ctx.connection,
      }),
    ];
  }

  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, arrayExpression],
    },
  });

  const targetProperty = Number(memberPath.pop());

  const arrayElm = arrayExpression.elements[targetProperty];

  if (arrayElm) {
    return handleNode(nextCtx, arrayElm);
  }

  // Should be unreachable, but if we reach it, we want to handle it anyway with
  // a unresolved temrinal node.
  return [
    makeUnresolvedTerminalNode({
      astNodes,
      reason: "unable to follow array expression",
      connection: ctx.connection,
    }),
  ];
}
