import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { isConstantTerminalNode, TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleCallExpression(
  ctx: HandlingContext,
  callExpression: TSESTree.CallExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, callExpression],
    },
  });

  const calleeIdentifier = handleNode(
    deepMerge(nextCtx, { meta: { forceIdentifierLiteral: true } }),
    callExpression.callee
  )[0];

  if (isConstantTerminalNode(calleeIdentifier)) {
    if (!nextCtx.meta.activeArguments[calleeIdentifier.value]) {
      nextCtx.meta.activeArguments[calleeIdentifier.value] = [];
    }

    nextCtx.meta.activeArguments[calleeIdentifier.value]?.push(
      callExpression.arguments.map((arg) => ({
        argument: arg,
        scope: getInnermostScope(ctx.scope, callExpression),
      }))
    );
  }

  return handleNode(nextCtx, callExpression.callee);
}
