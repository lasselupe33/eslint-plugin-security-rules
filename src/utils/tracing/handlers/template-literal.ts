import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { HandlingContext, TraceNode } from "../types";

import { handleNode } from "./_handle-node";

export function handleTemplateLiteral(
  ctx: HandlingContext,
  templateLiteral: TSESTree.TemplateLiteral
): TraceNode[] {
  const nextCtx: HandlingContext = {
    ...ctx,
    connection: {
      variable: ctx.connection?.variable,
      nodeType: AST_NODE_TYPES.TemplateLiteral,
    },
  };

  return templateLiteral.expressions.flatMap((expression) =>
    handleNode(nextCtx, expression)
  );
}
