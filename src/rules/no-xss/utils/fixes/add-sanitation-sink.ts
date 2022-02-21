import { TSESTree } from "@typescript-eslint/utils";
import {
  RuleFix,
  RuleFixer,
  Scope,
} from "@typescript-eslint/utils/dist/ts-eslint";

import { hasImportDeclaration } from "../../../../utils/ast/has-import-declaration";
import { createImportFix } from "../../../../utils/create-import-fix";
import { SanitationOptions } from "../options";

export function* addSanitazionAtSink(
  options: SanitationOptions,
  fixer: RuleFixer,
  unsafeNode: TSESTree.Node,
  moduleScope: Scope.Scope
): Generator<RuleFix> {
  const toInsertBefore = options.sanitation.usage.split("<%")[0] ?? "";
  const toInsertAfter = options.sanitation.usage.split("%>")[1] ?? "";

  yield fixer.insertTextBefore(unsafeNode, toInsertBefore);
  yield fixer.insertTextAfter(unsafeNode, toInsertAfter);

  if (
    !hasImportDeclaration(
      moduleScope,
      options.sanitation.package,
      options.sanitation.method
    )
  ) {
    yield createImportFix(
      fixer,
      options.sanitation.package,
      options.sanitation.method
    );
  }
}
