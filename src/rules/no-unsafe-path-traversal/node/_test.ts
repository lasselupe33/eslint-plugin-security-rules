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

ruleTester.run("node/no-unsafe-path-traversal", noNodeUnsafePathTraversal, {
  valid: [
    getCode(__dirname, "allow-safe-path"),
    getCode(__dirname, "allow-safe-with-nodejs-path"),
    getCode(__dirname, "inplace/allow-sanitized-inplace"),
    getCode(__dirname, "external/allow-sanitized-external"),
  ],
  invalid: [
    {
      ...getCode(__dirname, "error-unsafe-path"),
      errors: repeat({ messageId: MessageIds.VULNERABLE_PATH }, 4),
    },
    {
      ...getCode(__dirname, "error-unsafe-with-nodejs-path"),
      errors: repeat({ messageId: MessageIds.VULNERABLE_PATH }, 4),
    },
    {
      ...getCode(__dirname, "error-sanitation-after-modification"),
      errors: repeat({ messageId: MessageIds.VULNERABLE_PATH }, 1),
    },
    {
      ...getCode(__dirname, "error-sanitation-after-inline-modification"),
      errors: repeat({ messageId: MessageIds.VULNERABLE_PATH }, 1),
    },
  ],
});
