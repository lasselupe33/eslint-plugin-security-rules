import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { noUniversalVulnerableDependencies } from "./_rule";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: path.resolve(__dirname, "..", "..", "..", ".."),
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run(
  "universal/no-vulnerable-dependencies",
  noUniversalVulnerableDependencies,
  {
    valid: [
      // {
      //   code: getCode(__dirname, "allow-assign-safe-value"),
      // },
    ],
    invalid: [
      // {
      //   code: getCode(__dirname, "error-assign-unsafe-value"),
      //   errors: repeat({ messageId: MessageIds.VULNERABLE_SINK }, 27),
      // },
    ],
  }
);
