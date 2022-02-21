import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { noReactXSSRule } from "./_rule";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: path.resolve(__dirname, "..", "..", "..", ".."),
  },
});

ruleTester.run("react/no-xss", noReactXSSRule, {
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
});
