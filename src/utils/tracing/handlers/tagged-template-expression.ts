import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { isIdentifier } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleTaggedTemplateExpression(
  ctx: HandlingContext,
  taggedTemplateExpression: TSESTree.TaggedTemplateExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, taggedTemplateExpression],
    },
    meta: {
      callCount: ctx.meta.callCount + 1,
    },
  });

  const calleeIdentifiers = handleNode(
    deepMerge(nextCtx, {
      connection: { astNodes: [] },
      meta: {
        forceIdentifierLiteral: true,
        memberPath: [],
      },
    }),
    taggedTemplateExpression.tag
  );

  return calleeIdentifiers.flatMap((it) => {
    const identifierAstNode = it?.astNodes[it.astNodes.length - 1];

    if (isIdentifier(identifierAstNode)) {
      // Map our qausis to an ArrayExpression since they will be accessed using
      // ArrayPatterns when resolving parameters inside the tag function
      nextCtx.meta.parameterContext.set(identifierAstNode, {
        arguments: [
          {
            type: TSESTree.AST_NODE_TYPES.ArrayExpression,
            loc: taggedTemplateExpression.quasi.loc,
            range: taggedTemplateExpression.quasi.range,
            elements: taggedTemplateExpression.quasi.quasis.map((it) => ({
              type: TSESTree.AST_NODE_TYPES.Literal,
              loc: it.loc,
              range: it.range,
              raw: it.value.raw,
              value: it.value.cooked,
            })),
          },
          ...taggedTemplateExpression.quasi.expressions,
        ],
        scope: getInnermostScope(ctx.scope, taggedTemplateExpression),
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
