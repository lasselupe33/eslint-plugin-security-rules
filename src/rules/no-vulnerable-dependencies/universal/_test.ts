import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";
import { repeat } from "../../../utils/testing/repeat";

import { MessageIds, noUniversalVulnerableDependencies } from "./_rule";

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
    valid: [getCode(__dirname, "safe-deps/index")],
    invalid: [
      {
        ...getCode(__dirname, "unsafe-deps/index"),
        errors: repeat(
          { messageId: MessageIds.FOUND_VULNERABLE_DEPENDENCY },
          9
        ),
      },
    ],
  }
);
