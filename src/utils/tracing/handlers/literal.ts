import { TSESTree } from "@typescript-eslint/utils";

import { HandlingContext } from "../types/context";
import { makeConstantTerminalNode, TraceNode } from "../types/nodes";

export function handleLiteral(
  { connection }: HandlingContext,
  literal: TSESTree.Literal
): TraceNode[] {
  return [
    makeConstantTerminalNode({ value: String(literal.value), connection }),
  ];
}
