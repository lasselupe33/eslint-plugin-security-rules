import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { getIdentifierImportModule } from "./get-identifier-import-module";

export function isPackage(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  packageName: string,
  id?: TSESTree.Node
): boolean {
  const importModules = getIdentifierImportModule(context, [], id);

  for (const [name] of importModules) {
    if (
      name === packageName ||
      name.includes(packageName) ||
      name === "Unable to resolve related parameter"
    ) {
      return true;
    }
  }

  return false;
}
