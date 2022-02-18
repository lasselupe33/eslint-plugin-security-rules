import { TSESTree } from "@typescript-eslint/utils";

import { HandlingContext } from "../types/context";
import { makeLiteralTerminalNode, TraceNode } from "../types/nodes";

export function handleLiteral(
  { connection }: HandlingContext,
  literal: TSESTree.Literal
): TraceNode[] {
  return [
    makeLiteralTerminalNode({ value: String(literal.value), connection }),
  ];
}
