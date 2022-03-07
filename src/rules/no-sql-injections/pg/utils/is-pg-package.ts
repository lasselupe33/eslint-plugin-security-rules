import { TSESTree } from "@typescript-eslint/utils";

import { getNodeModule } from "../../../../utils/types/get-node-module";
import { getTypeProgram } from "../../../../utils/types/get-type-program";
import { HandlingContext } from "../_rule";

// @TODO: Typesystem to tracer

export function isPGPackage(
  ctx: HandlingContext,
  id: TSESTree.Identifier | undefined
): boolean {
  if (id) {
    const typeProgram = getTypeProgram(ctx.ruleContext);
    if (typeProgram) {
      const { fullyQualifiedName } = getNodeModule(typeProgram, id);
      if (!fullyQualifiedName?.includes("@types/pg/index")) {
        return false;
      }
    }
    return true;
  }
  return false;
}
