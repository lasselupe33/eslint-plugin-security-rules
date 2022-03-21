import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";
import { repeat } from "../../../utils/testing/repeat";

import { MessageIds, noNodeUnsafePathTraversal } from "./_rule";

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

ruleTester.run("react/no-xss", noNodeUnsafePathTraversal, {
  valid: [
    getCode(__dirname, "allow-safe-assignment"),
    getCode(__dirname, "allow-safe-hook-assignment"),
  ],
  invalid: [
    {
      ...getCode(__dirname, "error-assign-unsafe-value"),
      errors: repeat({ messageId: MessageIds.VULNERABLE_PATH }, 2),
    },
    {
      ...getCode(__dirname, "error-unsafe-hook-assignment"),
      errors: repeat({ messageId: MessageIds.VULNERABLE_PATH }, 1),
    },
  ],
});
