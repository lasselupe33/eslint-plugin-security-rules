import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";
import { repeat } from "../../../utils/testing/repeat";

import { MessageIds, noReactXSSRule } from "./_rule";

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

ruleTester.run("react/no-xss", noReactXSSRule, {
  valid: [
    {
      code: getCode(__dirname, "allow-safe-assignment"),
    },
    {
      code: getCode(__dirname, "allow-safe-hook-assignment"),
    },
  ],
  invalid: [
    {
      code: getCode(__dirname, "error-assign-unsafe-value"),
      errors: repeat({ messageId: MessageIds.VULNERABLE_SINK }, 2),
    },
    {
      code: getCode(__dirname, "error-unsafe-hook-assignment"),
      errors: repeat({ messageId: MessageIds.VULNERABLE_SINK }, 1),
    },
  ],
});
