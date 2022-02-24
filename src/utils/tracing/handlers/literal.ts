import { TSESTree } from "@typescript-eslint/utils";

import { HandlingContext } from "../types/context";
import { makeConstantTerminalNode, TraceNode } from "../types/nodes";

export function handleLiteral(
  ctx: HandlingContext,
  literal: TSESTree.Literal
): TraceNode[] {
  return [
    makeConstantTerminalNode({
      astNodes: [...ctx.connection.astNodes, literal],
      value: String(literal.value),
      connection: ctx.connection,
    }),
  ];
}
