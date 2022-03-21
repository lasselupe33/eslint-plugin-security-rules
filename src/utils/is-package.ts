import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { getIdentifierImportModule } from "../utils/get-identifier-import-module";

export function isPackage(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  packageName: string,
  id?: TSESTree.Identifier
): boolean {
  const importModules = getIdentifierImportModule(context, [], id);

  for (const [name] of importModules) {
    if (name === packageName) {
      return true;
    }
  }

  return false;
}
