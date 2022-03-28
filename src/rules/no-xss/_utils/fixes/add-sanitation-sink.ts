import { TSESTree } from "@typescript-eslint/utils";
import {
  RuleContext,
  RuleFix,
  RuleFixer,
} from "@typescript-eslint/utils/dist/ts-eslint";

import { createImportFix } from "../../../../utils/ast/import-fix";
import { SanitationOptions } from "../options";

export function* addSanitazionAtSink(
  context: RuleContext<string, unknown[]>,
  options: SanitationOptions,
  fixer: RuleFixer,
  unsafeNode: TSESTree.Node
): Generator<RuleFix> {
  const toInsertBefore = options.sanitation.usage.split("<%")[0] ?? "";
  const toInsertAfter = options.sanitation.usage.split("%>")[1] ?? "";

  yield fixer.insertTextBefore(unsafeNode, toInsertBefore);
  yield fixer.insertTextAfter(unsafeNode, toInsertAfter);
  yield createImportFix(context, options.sanitation);
}
