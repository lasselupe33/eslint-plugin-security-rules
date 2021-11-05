import path from "path";

import { parseForESLint } from "@typescript-eslint/parser";
import { Linter } from "eslint";
import fs from "fs-extra";

import { multiFileRule } from "../../src/rules/multi-file-rule";

export async function performanceTest(
  entrypoint: string,
  warmupIterations: number,
  iterations: number
): Promise<void> {
  const linter = new Linter();
  const fileName = require.resolve(path.join(process.cwd(), entrypoint));

  const code = await fs.readFile(fileName, "utf-8");

  // @ts-expect-error tmpp
  linter.defineParser("test", { parseForESLint });
  linter.defineRule("tmp-rule", multiFileRule);

  for (let i = 0; i < warmupIterations; i++) {
    linter.verify(
      code,
      {
        parser: "test",
        rules: {
          "tmp-rule": "warn",
        },
      },
      { filename: fileName }
    );
  }

  const startedAt = performance.now();
  for (let i = 0; i < iterations; i++) {
    linter.verify(
      code,
      {
        parser: "test",
        rules: {
          "tmp-rule": "warn",
        },
      },
      { filename: fileName }
    );
  }
  const endedAt = performance.now();
  const runtimeMs = endedAt - startedAt;

  console.log();
  console.log(`Finished ${iterations} iterations in ${runtimeMs.toFixed(3)}ms`);
  console.log(`    Avg. ${(runtimeMs / iterations).toFixed(3)}ms.`);
  console.log();
}

performanceTest(
  process.argv[4] as unknown as string,
  process.argv[2] as unknown as number,
  process.argv[3] as unknown as number
);
