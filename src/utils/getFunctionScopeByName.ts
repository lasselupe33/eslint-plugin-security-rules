import { Scope, SourceCode } from "eslint";

export function getFunctionScopeByName(
  sourceCode: SourceCode,
  functionName: string
): Scope.Scope | undefined {
  return sourceCode.scopeManager.scopes.find(
    (it) =>
      it.block.type === "FunctionDeclaration" &&
      it.block.id?.name === functionName
  );
}
