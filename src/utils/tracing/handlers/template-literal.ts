import { TSESTree } from "@typescript-eslint/utils";

import { isRangeAfter } from "../../ast/is-range-after";
import { deepMerge } from "../../deep-merge";
import { ConnectionTypes } from "../types/connection";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleTemplateLiteral(
  ctx: HandlingContext,
  templateLiteral: TSESTree.TemplateLiteral
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, templateLiteral],
      type: ConnectionTypes.MODIFICATION,
    },
  });

  const nodes = [
    ...templateLiteral.expressions,
    ...templateLiteral.quasis,
  ].sort((a, b) => isRangeAfter(a.range, b.range));

  return nodes.flatMap((expression) => handleNode(nextCtx, expression));
}
