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
    meta: {
      callCount: ctx.meta.callCount + 1,
    },
  });

  const calleeIdentifiers = handleNode(
    deepMerge(nextCtx, {
      connection: { astNodes: [] },
      meta: { forceIdentifierLiteral: true, memberPath: [] },
    }),
    newExpression.callee
  );

  return calleeIdentifiers.flatMap((it) => {
    const identifierAstNode = it?.astNodes[it.astNodes.length - 1];

    if (isIdentifier(identifierAstNode)) {
      nextCtx.meta.parameterContext.set(identifierAstNode, {
        scope: getInnermostScope(ctx.scope, newExpression),
        arguments: newExpression.arguments,
      });
    }

    return handleNode(
      deepMerge(nextCtx, {
        connection: {
          astNodes: [...nextCtx.connection.astNodes, ...(it?.astNodes ?? [])],
        },
        meta: {
          memberPath: [
            ...nextCtx.meta.memberPath,
            ...(it?.meta.memberPath ?? []),
          ],
          callCount: it.meta.callCount,
        },
      }),
      identifierAstNode
    );
  });
}
