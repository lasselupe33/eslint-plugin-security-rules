import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { getIdentifierImportModule } from "./get-identifier-import-module";

export function isPackageAndFunction(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  packageName: string,
  functionNamesParam: string[] | string,
  id?: TSESTree.Node
): boolean {
  const functionNames = Array.isArray(functionNamesParam)
    ? functionNamesParam
    : [functionNamesParam];

  const importModules = getIdentifierImportModule(context, functionNames, id);

  for (const { pathOrImport, didMatchFunctionName } of importModules) {
    if (
      (pathOrImport === packageName ||
        pathOrImport?.includes(packageName) ||
        typeof pathOrImport === "undefined") &&
      didMatchFunctionName === true
    ) {
      return true;
    }
  }

  return false;
}
