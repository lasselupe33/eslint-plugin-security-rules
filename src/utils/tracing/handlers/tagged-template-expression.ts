import { TemplateElement } from "@typescript-eslint/types/dist/ast-spec";
import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

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
  });

  const calleeIdentifier = taggedTemplateExpression.tag as TSESTree.Identifier;

  const test: TemplateElement[] = taggedTemplateExpression.quasi.quasis;

  // @TODO: Implemented argument tracing

  /*   nextCtx.meta.activeArguments.set(
    calleeIdentifier,
    {
      taggedTemplateExpression.quasi.quasis,
      taggedTemplateExpression.quasi.expressions,
      scope: getInnermostScope(ctx.scope, taggedTemplateExpression)
    },
  ); */

  return handleNode(nextCtx, taggedTemplateExpression.tag);
}
