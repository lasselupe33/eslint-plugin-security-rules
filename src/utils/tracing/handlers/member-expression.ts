import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { HandlingContext, isTerminalNode, TraceNode } from "../types";

import { handleNode } from "./_handle-node";

export function handleMemberExpression(
  ctx: HandlingContext,
  memberExpression: TSESTree.MemberExpression
): TraceNode[] {
  const pathTerminal = handleNode(ctx, memberExpression.property)[0];
  const pathName = isTerminalNode(pathTerminal)
    ? pathTerminal.value
    : undefined;

  const nextCtx: HandlingContext = {
    ...ctx,
    connection: {
      variable: ctx.connection?.variable,
      nodeType: AST_NODE_TYPES.MemberExpression,
      meta: {
        // Update context to notify future handlers which parts of objects
        // should be traversed to trace to the relevant value.
        objectPath: Array.isArray(ctx.connection.meta["objectPath"])
          ? [...ctx.connection.meta["objectPath"], pathName]
          : [pathName],
      },
    },
  };

  return handleNode(nextCtx, memberExpression.object);
}
