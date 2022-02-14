import { TSESTree } from "@typescript-eslint/utils";

import { getNodeModule } from "../../../../utils/types/get-node-module";
import { getTypeProgram } from "../../../../utils/types/get-type-program";
import { HandlingContext } from "../_rule";

export function handleIdentifier(
  ctx: HandlingContext,
  id: TSESTree.Identifier | undefined
): boolean {
  if (id && id.name === "query") {
    const typeProgram = getTypeProgram(ctx.ruleContext);
    if (typeProgram) {
      const { fullyQualifiedName } = getNodeModule(typeProgram, id);
      if (!fullyQualifiedName?.includes("@types/mysql/index")) {
        return false;
      }
    }
    return true;
  }
  return false;
}
