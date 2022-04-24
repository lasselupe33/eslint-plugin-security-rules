import { ESLint } from "eslint";

export async function entrypoint(files: string): Promise<void> {
  const filesPattern = `${files}/**/*.{json,js,jsx,ts,tsx}`;

  const eslintWithRules = makeESLint(true);
  const { heapUsed: startIncludingRules } = process.memoryUsage();
  await eslintWithRules.lintFiles(filesPattern);
  const { heapUsed: endIncludingRules } = process.memoryUsage();

  const eslintWithoutRules = makeESLint(false);
  const { heapUsed: startExcludingRules } = process.memoryUsage();
  await eslintWithoutRules.lintFiles(filesPattern);
  const { heapUsed: endExcludingRules } = process.memoryUsage();

  console.log(
    JSON.stringify({
      withRules: (endIncludingRules - startIncludingRules) / 1024 / 1024,
      withoutRules: (endExcludingRules - startExcludingRules) / 1024 / 1024,
    })
  );
}

function makeESLint(withRules?: boolean) {
  return new ESLint({
    baseConfig: {
      parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
        ecmaFeatures: {
          globalReturn: true,
          jsx: true,
        },
      },
      env: {
        node: true,
        browser: true,
        es6: true,
      },
      extends: withRules ? ["plugin:security-rules/recommended"] : [],
      overrides: [
        {
          files: ["*.ts", "*.tsx"],
          parser: "@typescript-eslint/parser",
        },
        {
          files: ["*.json"],
          parser: "jsonc-eslint-parser",
        },
      ],
    },
    cache: false,
    useEslintrc: false,
  });
}

entrypoint(process.argv[2] as unknown as string);
