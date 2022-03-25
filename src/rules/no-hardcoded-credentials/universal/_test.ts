import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";

import { uniNoHardcodedCredentials, MessageIds } from "./_rule";

enum validTests {}

enum invalidTests {
  NO_PASSWORD_ARRAY_VARIABLE_DECLARATION = "error-no-password-array-variable-declaration",
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
      // {
      //   code: getCode(__dirname, validTests.CREATECONNECTION_PROCESS_ENV),
      // },
    ],
    invalid: [
      {
        ...getCode(
          __dirname,
          invalidTests.NO_PASSWORD_ARRAY_VARIABLE_DECLARATION
        ),
        errors: [{ messageId: MessageIds.ERRROR1 }],
      },
      {
        ...getCode(
          __dirname,
          invalidTests.NO_PASSWORD_OBJECT_VARIABLE_DECLARATION
        ),
        errors: [{ messageId: MessageIds.ERRROR1 }],
      },
      {
        ...getCode(__dirname, invalidTests.NO_PASSWORD_VARIABLE_DECLARATIONS),
        errors: [{ messageId: MessageIds.ERRROR1 }],
      },
    ],
  }
);
