import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

export function getModuleScope(scope: Scope.Scope): Scope.Scope {
  let currentScope: Scope.Scope | null = scope;

  while (currentScope.upper && currentScope.type !== "module") {
    currentScope = currentScope.upper;
  }

  return currentScope ?? scope;
}
