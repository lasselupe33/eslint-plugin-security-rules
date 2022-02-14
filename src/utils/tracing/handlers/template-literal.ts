import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { isRangeAfter } from "../../is-range-after";
import { ConnectionTypes, HandlingContext, TraceNode } from "../types";

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
      type: ConnectionTypes.MODIFICATION,
    },
  };

  const nodes = [
    ...templateLiteral.expressions,
    ...templateLiteral.quasis,
  ].sort((a, b) => isRangeAfter(a.range, b.range));

  return nodes.flatMap((expression) => handleNode(nextCtx, expression));
}
