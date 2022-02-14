import { TSESTree } from "@typescript-eslint/utils";

import { HandlingContext, TraceNode } from "../types";

export function handleTemplateElement(
  ctx: HandlingContext,
  templateElement: TSESTree.TemplateElement
): TraceNode[] {
  return [{ value: templateElement.value.raw, connection: ctx.connection }];
}
