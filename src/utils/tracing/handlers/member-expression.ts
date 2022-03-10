import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import {
  isConstantTerminalNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";

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
    deepMerge(baseNextCtx, {
      connection: { astNodes: [] },
      meta: { forceIdentifierLiteral: true },
    }),
    memberExpression.property
  )[0];

  if (!isConstantTerminalNode(pathTerminal)) {
    return [
      makeUnresolvedTerminalNode({
        reason:
          "handleMemberExpression(): Unable to extract the pathName to follow.",
        connection: baseNextCtx.connection,
        astNodes: [
          ...baseNextCtx.connection.astNodes,
          ...(pathTerminal?.astNodes ?? []),
        ],
      }),
    ];
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

  return handleNode(nextCtx, memberExpression.object);
}
