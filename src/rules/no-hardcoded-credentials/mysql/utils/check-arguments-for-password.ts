import { TSESTree } from "@typescript-eslint/utils";

import { isIdentifier, isProperty, isLiteral } from "../../../../utils/guards";
import { isSafeValue } from "../../utils/is-safe-value";
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
      if (isLiteral(property.value) && !isSafeValue(property.value)) {
        report(property.value, ctx);
      }
    }
  }
}
