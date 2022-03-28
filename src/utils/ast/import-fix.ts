import { RuleContext, RuleFix } from "@typescript-eslint/utils/dist/ts-eslint";

import { getModuleScope } from "./get-module-scope";
import { hasImportDeclaration } from "./has-import-declaration";

export function createImportFix(
  context: RuleContext<string, unknown[]>,
  toImport: { package: string; method: string },
  { asDefault }: { asDefault: boolean } = { asDefault: false }
): RuleFix {
  if (hasImportDeclaration(getModuleScope(context.getScope()), toImport)) {
    return { range: [0, 0], text: "" };
  }

  const methodImport = asDefault ? toImport.method : `{ ${toImport.method} }`;

  return {
    range: [0, 0],
    text: `import ${methodImport} from "${toImport.package}";\n`,
  };
}
