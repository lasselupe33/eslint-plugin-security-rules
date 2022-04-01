import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { getIdentifierImportModule } from "./get-identifier-import-module";

export function isPackageAndFunction(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  packageName: string,
  functionNames: string[] | string,
  id?: TSESTree.Node
): boolean {
  let _functionNames = [];
  if (!Array.isArray(functionNames)) {
    _functionNames = [functionNames];
  } else {
    _functionNames = functionNames;
  }

  const importModules = getIdentifierImportModule(context, _functionNames, id);

  for (const [name, value] of importModules) {
    if (
      (name === packageName ||
        name === "Unable to resolve related parameter" ||
        name.includes(packageName)) &&
      value === true
    ) {
      return true;
    }
  }

  return false;
}
