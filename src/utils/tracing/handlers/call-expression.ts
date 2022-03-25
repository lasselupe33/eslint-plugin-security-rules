import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { isIdentifier } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { handleNodeOverrides } from "../overrides/node";
import { handleVanillaOverrides } from "../overrides/vanilla";
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

  const calleeIdentifiers = handleNode(
    deepMerge(nextCtx, {
      connection: { astNodes: [] },
      meta: {
        memberPath: [],
      },
    }),
    callExpression.callee
  );

  // Generate parameter to argument mapping
  for (const calleeIdentifier of calleeIdentifiers) {
    const identifierAstNode =
      calleeIdentifier?.astNodes[calleeIdentifier.astNodes.length - 1];

    if (isIdentifier(identifierAstNode)) {
      nextCtx.meta.parameterContext.set(identifierAstNode, {
        scope: getInnermostScope(ctx.scope, callExpression),
        arguments: callExpression.arguments,
      });
    }
  }

  // In case overrides (of e.g. native API's such as arr.join()) has been
  // supplied, then we return these immediately.
  const overrides =
    handleNodeOverrides(nextCtx, callExpression, calleeIdentifiers) ??
    handleVanillaOverrides(nextCtx, callExpression);

  if (overrides) {
    return overrides;
  }

  return calleeIdentifiers.flatMap((it) => {
    const identifierAstNode = it?.astNodes[it.astNodes.length - 1];

    return handleNode(
      deepMerge(nextCtx, {
        connection: {
          astNodes: [
            ...nextCtx.connection.astNodes,
            ...(it?.astNodes.slice(0, -2) ?? []),
          ],
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
