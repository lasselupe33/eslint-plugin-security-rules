import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { isConstantTerminalNode, TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleMemberExpression(
  ctx: HandlingContext,
  memberExpression: TSESTree.MemberExpression
): TraceNode[] {
  const pathTerminal = handleNode(
    deepMerge(ctx, { meta: { forceIdentifierLiteral: true } }),
    memberExpression.property
  )[0];

  if (
    !isConstantTerminalNode(pathTerminal) ||
    typeof pathTerminal.value !== "string"
  ) {
    throw new Error(
      "handleMemberExpression(): Unable to extract the pathName to follow. This is not intentional, please file a bug report."
    );
  }

  const pathName = pathTerminal.value;

  const nextCtx = deepMerge(ctx, {
    connection: {
      variable: ctx.connection?.variable,
      nodeType: AST_NODE_TYPES.MemberExpression,
    },
    meta: {
      // Update context to notify future handlers which parts of objects
      // should be traversed to trace to the relevant value.
      memberPath: [...ctx.meta.memberPath, pathName ?? ""],
    },
  });

  return handleNode(nextCtx, memberExpression.object);
}
