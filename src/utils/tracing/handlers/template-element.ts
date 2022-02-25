import { TSESTree } from "@typescript-eslint/utils";

import { HandlingContext } from "../types/context";
import { makeConstantTerminalNode, TraceNode } from "../types/nodes";

export function handleTemplateElement(
  ctx: HandlingContext,
  templateElement: TSESTree.TemplateElement
): TraceNode[] {
  return [
    makeConstantTerminalNode({
      astNodes: [...ctx.connection.astNodes, templateElement],
      value: templateElement.value.raw,
      connection: ctx.connection,
    }),
  ];
}
