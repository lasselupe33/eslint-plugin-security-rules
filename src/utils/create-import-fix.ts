import { RuleFix, RuleFixer } from "@typescript-eslint/utils/dist/ts-eslint";

export function createImportFix(
  fixer: RuleFixer,
  pkg: string,
  method: string,
  { asDefault }: { asDefault: boolean } = { asDefault: false }
): RuleFix {
  const methodImport = asDefault ? method : `{ ${method} }`;

  return fixer.insertTextBeforeRange(
    [0, 0],
    `import ${methodImport} from "${pkg}";\n\n`
  );
}
