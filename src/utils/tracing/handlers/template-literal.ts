import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { isRangeAfter } from "../../is-range-after";
import { ConnectionTypes, HandlingContext, TraceNode } from "../types";

import { handleNode } from "./_handle-node";

export function handleTemplateLiteral(
  ctx: HandlingContext,
  templateLiteral: TSESTree.TemplateLiteral
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      nodeType: AST_NODE_TYPES.TemplateLiteral,
      type: ConnectionTypes.MODIFICATION,
    },
  });

  const nodes = [
    ...templateLiteral.expressions,
    ...templateLiteral.quasis,
  ].sort((a, b) => isRangeAfter(a.range, b.range));

  return nodes.flatMap((expression) => handleNode(nextCtx, expression));
}
