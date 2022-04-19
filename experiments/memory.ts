import { execSync } from "child_process";
import path from "path";

import { ESLint } from "eslint";
import fs from "fs-extra";

export async function entrypoint(files: string): Promise<void> {
  const filesPattern = `${files}/**/*.{json,js,jsx,ts,tsx}`;

  const rawLoC = execSync(`cloc $(find ${files})`, { encoding: "utf-8" });
  const jsLoC = rawLoC
    .split("\n")
    ?.filter(
      (it) =>
        it.includes("JavaScript") ||
        it.includes("TypeScript") ||
        it.includes("JSON")
    )
    ?.map((it) => it.split(" ")?.filter((it) => !!it))
    ?.reduce<[string, number, number, number, number]>(
      (acc, curr) => [
        acc[0] + curr[0],
        (acc[1] ?? 0) + Number(curr[1]),
        (acc[2] ?? 0) + Number(curr[2]),
        (acc[3] ?? 0) + Number(curr[3]),
        (acc[4] ?? 0) + Number(curr[4]),
      ],
      ["", 0, 0, 0, 0]
    );

  const eslintWithRules = makeESLint(true);
  const { heapUsed: startIncludingRules } = process.memoryUsage();
  await eslintWithRules.lintFiles(filesPattern);
  const { heapUsed: endIncludingRules } = process.memoryUsage();

  const eslintWithoutRules = makeESLint(false);
  const { heapUsed: startExcludingRules } = process.memoryUsage();
  await eslintWithoutRules.lintFiles(filesPattern);
  const { heapUsed: endExcludingRules } = process.memoryUsage();

  const stats = {
    heapUsageMb: {
      withRules: (endIncludingRules - startIncludingRules) / 1024 / 1024,
      withoutRules: (endExcludingRules - startExcludingRules) / 1024 / 1024,
    },
    meta: {
      target: files,
      linesOfCode: {
        files: Number(jsLoC?.[1]),
        blank: Number(jsLoC?.[2]),
        comment: Number(jsLoC?.[3]),
        code: Number(jsLoC?.[4]),
      },
    },
  };

  const outDir = path.join(__dirname, "results", "memory", `${jsLoC?.[4]}`);
  fs.mkdirpSync(outDir);

  fs.writeFileSync(
    path.join(outDir, `${new Date().toISOString().replace(/[:.]/g, "-")}.json`),
    JSON.stringify(stats, undefined, 2),
    { encoding: "utf-8" }
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
