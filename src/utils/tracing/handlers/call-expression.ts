import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { isIdentifier } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { handleOverrides } from "../overrides/calls";
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
      callCount: ctx.meta.callCount + 1,
    },
  });

  // In case overrides (of e.g. native API's such as arr.join()) has been
  // supplied, then we return these immediately.
  const overrides = handleOverrides(nextCtx, callExpression);

  if (overrides) {
    return overrides;
  }

  const calleeIdentifiers = handleNode(
    deepMerge(nextCtx, {
      connection: { astNodes: [] },
      meta: {
        forceIdentifierLiteral: true,
        memberPath: [],
      },
    }),
    callExpression.callee
  );

  return calleeIdentifiers.flatMap((it) => {
    const identifierAstNode = it?.astNodes[it.astNodes.length - 1];

    if (isIdentifier(identifierAstNode)) {
      nextCtx.meta.parameterContext.set(identifierAstNode, {
        scope: getInnermostScope(ctx.scope, callExpression),
        arguments: callExpression.arguments,
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
