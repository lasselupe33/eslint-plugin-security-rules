import { RuleFix, RuleFixer } from "@typescript-eslint/utils/dist/ts-eslint";

export function createImportFix(
  fixer: RuleFixer,
  pkg: string,
  method: string
): RuleFix {
  return fixer.insertTextBeforeRange(
    [0, 0],
    `import { ${method} } from "${pkg}";\n\n`
  );
}
