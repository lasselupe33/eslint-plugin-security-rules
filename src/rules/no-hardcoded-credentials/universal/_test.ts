import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";

import { uniNoHardcodedCredentials } from "./_rule";
import { MessageIds } from "./utils/messages";

enum validTests {
  PASSIVE_WORD = "allow-passive-word",
  PASSWORD_LENGTH_LIMIT = "allow-password-length-limit",
}

enum invalidTests {
  NO_PASSWORD_ARRAY_VARIABLE_DECLARATION = "error-no-password-array-variable-declaration",
  NO_PASSWORD_OBJECT_IN_ARRAY = "error-no-password-object-in-array",
  NO_PASSWORD_OBJECT_VARIABLE_DECLARATION = "error-no-password-object-variable-declaration",
  NO_PASSWORD_VARIABLE_DECLARATIONS = "error-no-password-variable-declarations",
}

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
  "universal/no-hardcoded-credentials",
  uniNoHardcodedCredentials,
  {
    valid: [
      {
        ...getCode(__dirname, validTests.PASSIVE_WORD),
      },
      {
        ...getCode(__dirname, validTests.PASSWORD_LENGTH_LIMIT),
      },
    ],
    invalid: [
      {
        ...getCode(
          __dirname,
          invalidTests.NO_PASSWORD_ARRAY_VARIABLE_DECLARATION
        ),
        errors: [{ messageId: MessageIds.HARDCODED_CREDENTIAL }],
      },
      {
        ...getCode(__dirname, invalidTests.NO_PASSWORD_OBJECT_IN_ARRAY),
        errors: [{ messageId: MessageIds.HARDCODED_CREDENTIAL }],
      },
      {
        ...getCode(
          __dirname,
          invalidTests.NO_PASSWORD_OBJECT_VARIABLE_DECLARATION
        ),
        errors: [{ messageId: MessageIds.HARDCODED_CREDENTIAL }],
      },
      {
        ...getCode(__dirname, invalidTests.NO_PASSWORD_VARIABLE_DECLARATIONS),
        errors: [{ messageId: MessageIds.HARDCODED_CREDENTIAL }],
      },
    ],
  }
);
