import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";

import { MessageIds, noEjsXSSRule } from "./_rule";

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

ruleTester.run("ejs/no-xss", noEjsXSSRule, {
  valid: [
    {
      code: getCode(__dirname, "allow-sanitized-data"),
    },
  ],
  invalid: [
    {
      code: getCode(__dirname, "error-unsanitized-data"),
      errors: [{ messageId: MessageIds.VULNERABLE_DATA }],
    },
  ],
});
