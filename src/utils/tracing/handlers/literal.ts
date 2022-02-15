import { TSESTree } from "@typescript-eslint/utils";

import { HandlingContext, TraceNode } from "../types";

export function handleLiteral(
  { connection }: HandlingContext,
  literal: TSESTree.Literal
): TraceNode[] {
  return [{ value: String(literal.value), connection, type: "constant" }];
}
