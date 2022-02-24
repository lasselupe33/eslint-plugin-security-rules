import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { isConstantTerminalNode, TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleMemberExpression(
  ctx: HandlingContext,
  memberExpression: TSESTree.MemberExpression
): TraceNode[] {
  const baseNextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, memberExpression],
    },
  });

  const pathTerminal = handleNode(
    deepMerge(baseNextCtx, { meta: { forceIdentifierLiteral: true } }),
    memberExpression.property
  )[0];

  if (!isConstantTerminalNode(pathTerminal)) {
    throw new Error(
      "handleMemberExpression(): Unable to extract the pathName to follow. This is not intentional, please file a bug report."
    );
  }

  const pathName = pathTerminal.value;

  const nextCtx = deepMerge(baseNextCtx, {
    connection: {
      astNodes: [...baseNextCtx.connection.astNodes, ...pathTerminal.astNodes],
    },
    meta: {
      // Update context to notify future handlers which parts of objects
      // should be traversed to trace to the relevant value.
      memberPath: [...ctx.meta.memberPath, pathName ?? ""],
    },
  });

  return [pathTerminal, ...handleNode(nextCtx, memberExpression.object)];
}
