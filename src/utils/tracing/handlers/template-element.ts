import { TSESTree } from "@typescript-eslint/utils";

import { HandlingContext } from "../types/context";
import { makeLiteralTerminalNode, TraceNode } from "../types/nodes";

export function handleTemplateElement(
  ctx: HandlingContext,
  templateElement: TSESTree.TemplateElement
): TraceNode[] {
  return [
    makeLiteralTerminalNode({
      value: templateElement.value.raw,
      connection: ctx.connection,
    }),
  ];
}
