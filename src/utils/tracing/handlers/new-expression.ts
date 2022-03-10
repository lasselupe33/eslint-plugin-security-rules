import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { isConstantTerminalNode, TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleNewExpression(
  ctx: HandlingContext,
  newExpression: TSESTree.NewExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, newExpression],
    },
  });

  const calleeIdentifier = handleNode(
    deepMerge(nextCtx, { meta: { forceIdentifierLiteral: true } }),
    newExpression.callee
  )[0];

  if (isConstantTerminalNode(calleeIdentifier)) {
    if (!nextCtx.meta.activeArguments[calleeIdentifier.value]) {
      nextCtx.meta.activeArguments[calleeIdentifier.value] = [];
    }

    nextCtx.meta.activeArguments[calleeIdentifier.value]?.push(
      newExpression.arguments.map((arg) => ({
        argument: arg,
        scope: getInnermostScope(ctx.scope, newExpression),
      }))
    );
  }

  return handleNode(nextCtx, newExpression.callee);
}
