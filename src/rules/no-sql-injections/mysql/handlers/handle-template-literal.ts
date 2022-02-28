import { TSESTree } from "@typescript-eslint/utils";

import { isRangeAfter } from "../../../../utils/ast/is-range-after";
import { HandlingContext } from "../_rule";
import { isSourceEscaped } from "../utils/is-escaped-identifier";

export function handleTemplateLiteral(
  context: HandlingContext,
  templateLiteral: TSESTree.TemplateLiteral
): [TSESTree.Expression | TSESTree.TemplateElement, boolean | undefined][] {
  const nodes = [
    ...templateLiteral.expressions,
    ...templateLiteral.quasis,
  ].sort((a, b) => isRangeAfter(a.range, b.range));

  const boolNodes: [
    TSESTree.Expression | TSESTree.TemplateElement,
    boolean | undefined
  ][] = nodes.map((val) => [val, isSourceEscaped(context, val)]);

  return boolNodes;
}
