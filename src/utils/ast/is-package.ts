import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { getIdentifierImportModule } from "./get-identifier-import-module";

export function isPackage(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  packageName: string,
  id?: TSESTree.Node
): boolean {
  const importModules = getIdentifierImportModule(context, [], id);

  for (const { pathOrImport } of importModules) {
    if (
      pathOrImport === packageName ||
      pathOrImport?.includes(packageName) ||
      typeof pathOrImport === "undefined" // If we're unable to trace due to a parameter, we allow the rules to continue.
    ) {
      return true;
    }
  }

  return false;
}
