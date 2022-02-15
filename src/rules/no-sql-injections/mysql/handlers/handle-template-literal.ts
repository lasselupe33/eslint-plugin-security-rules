import { template } from "@babel/core";
import { TSESTree } from "@typescript-eslint/utils";

import { isTemplateElement } from "../../../../utils/guards";
import { isRangeAfter } from "../../../../utils/is-range-after";
import { HandlingContext } from "../_rule";
import { isEscapedExpression } from "../utils/is-escaped-identifier";

export function handleTemplateLiteral(
  context: HandlingContext,
  templateLiteral: TSESTree.TemplateLiteral
): (TSESTree.Expression | TSESTree.TemplateElement)[] {
  const nodes = [
    ...templateLiteral.expressions,
    ...templateLiteral.quasis,
  ].sort((a, b) => isRangeAfter(a.range, b.range));

  // Currently, we're filtering away values that is escaped.
  // Perhaps this is bad, when doing rewrite?
  const res = nodes.filter((element) => {
    if (isTemplateElement(element)) {
      return true;
    } else {
      return !isEscapedExpression(context, element);
    }
  });

  return res;
}
