import path from "path";

import { ESLint } from "eslint";

export async function performanceTest(
  entrypoint: string,
  warmupIterations: number,
  iterations: number
): Promise<void> {
  const eslint = new ESLint({
    baseConfig: {
      parser: "@typescript-eslint/parser",
      plugins: ["security-rules"],
      rules: {
        "security-rules/multi-file-rule": "warn",
      },
    },
    cache: false,
    useEslintrc: false,
  });
  const fileName = require.resolve(path.join(process.cwd(), entrypoint));

  let startedAt = performance.now();
  await eslint.lintFiles([fileName]);
  let endedAt = performance.now();
  let runtimeMs = endedAt - startedAt;

  console.log();
  console.log(`Cold run finished in ${runtimeMs.toFixed(3)}ms.`);

  for (let i = 0; i < warmupIterations; i++) {
    await eslint.lintFiles([fileName]);
  }

  startedAt = performance.now();
  for (let i = 0; i < iterations; i++) {
    await eslint.lintFiles([fileName]);
  }
  endedAt = performance.now();
  runtimeMs = endedAt - startedAt;

  console.log("--------");
  console.log(`Finished ${iterations} iterations in ${runtimeMs.toFixed(3)}ms`);
  console.log(`    Avg. ${(runtimeMs / iterations).toFixed(3)}ms.`);
  console.log();
}

performanceTest(
  process.argv[4] as unknown as string,
  process.argv[2] as unknown as number,
  process.argv[3] as unknown as number
);
