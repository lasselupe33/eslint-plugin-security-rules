import { TSESTree } from "@typescript-eslint/utils";

import { isIdentifier, isProperty } from "../../../../utils/ast/guards";
import { isSafeValue } from "../../_utils/is-safe-value";
import { HandlingContext, report } from "../_rule";

export function checkArgumentsForPassword(
  ctx: HandlingContext,
  properties: TSESTree.ObjectLiteralElement[] | undefined
) {
  if (!properties) {
    return;
  }
  for (const property of properties) {
    if (
      isProperty(property) &&
      isIdentifier(property.key) &&
      property.key.name.toLowerCase() === "password"
    ) {
      if (!isSafeValue(ctx.ruleContext, property.value)) {
        report(property.key, property.value, ctx);
      }
    }
  }
}
