import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";
import { repeat } from "../../../utils/testing/repeat";

import { MessageIds, noBrowserXSSRule } from "./_rule";

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

ruleTester.run("browser/no-xss", noBrowserXSSRule, {
  valid: [
    getCode(__dirname, "allow-assign-safe-value"),
    getCode(__dirname, "allow-assign-sanitized-value"),
  ],
  invalid: [
    {
      ...getCode(__dirname, "error-assign-unsafe-value"),
      errors: repeat({ messageId: MessageIds.VULNERABLE_SINK }, 27),
    },
    {
      ...getCode(__dirname, "error-unsafe-modification"),
      errors: repeat({ messageId: MessageIds.VULNERABLE_SINK }, 1),
    },
  ],
});
