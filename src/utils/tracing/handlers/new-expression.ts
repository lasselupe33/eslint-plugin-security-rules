import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { isIdentifier } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

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
  const calleeIdentifierAstNode =
    calleeIdentifier?.astNodes[calleeIdentifier.astNodes.length - 1];

  if (isIdentifier(calleeIdentifierAstNode)) {
    nextCtx.meta.activeArguments.set(
      calleeIdentifierAstNode,
      newExpression.arguments.map((arg) => ({
        argument: arg,
        scope: getInnermostScope(ctx.scope, newExpression),
      }))
    );
  }

  return handleNode(
    deepMerge(nextCtx, {
      connection: {
        astNodes: [
          ...nextCtx.connection.astNodes,
          ...(calleeIdentifier?.astNodes ?? []),
        ],
      },
    }),
    calleeIdentifierAstNode
  );
}
