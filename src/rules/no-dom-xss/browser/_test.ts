import fs from "fs";
import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { MessageIds, noDomXSSRule } from "./_rule";

function getCode(name: string): string {
  return fs.readFileSync(
    require.resolve(path.join(__dirname, "tests", name)),
    "utf-8"
  );
}

function repeat<T>(it: T, times: number): T[] {
  return new Array(times).fill(it) as T[];
}

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: path.resolve(__dirname, "..", "..", "..", ".."),
  },
});

ruleTester.run("browser/no-dom-xss", noDomXSSRule, {
  valid: [
    {
      code: getCode("allow-assign-safe-value"),
    },
  ],
  invalid: [
    {
      code: getCode("error-assign-unsafe-value"),
      errors: repeat({ messageId: MessageIds.VULNERABLE_SINK }, 27),
    },
  ],
});
