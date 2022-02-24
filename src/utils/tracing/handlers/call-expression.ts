import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleCallExpression(
  ctx: HandlingContext,
  callExpression: TSESTree.CallExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, callExpression],
    },
    meta: {
      activeArguments: callExpression.arguments.map((arg) => ({
        argument: arg,
        scope: getInnermostScope(ctx.scope, callExpression),
      })),
    },
  });

  return handleNode(nextCtx, callExpression.callee);
}
