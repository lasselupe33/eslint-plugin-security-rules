import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { isImportDeclaration, isProgram } from "./guards";

export function hasImportDeclaration(
  moduleScope: Scope.Scope,
  pkg: string,
  method: string
): boolean {
  if (!isProgram(moduleScope.block)) {
    return false;
  }

  const importDeclarations = moduleScope.block.body.filter(
    (it): it is TSESTree.Node & { type: AST_NODE_TYPES.ImportDeclaration } =>
      isImportDeclaration(it)
  );

  return importDeclarations.some(
    (declaration) =>
      declaration.source.value === pkg &&
      declaration.specifiers.some(
        (specifier) => specifier.local.name === method
      )
  );
}
