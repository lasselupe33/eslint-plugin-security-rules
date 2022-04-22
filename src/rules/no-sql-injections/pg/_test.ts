import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";
import { MessageIds } from "../_utils/messages";

import { pgNoSQLInjections } from "./_rule";

enum validTests {
  CALLBACK = "allow-callback",
  PREPARED_STATEMENTS = "allow-prepared-statement",
  PROMISE_QUERY = "allow-promise-query",
  PROMISE = "allow-promise",
}

enum invalidTests {
  ASYNC_FUNCTION_CALL = "error-async-function-call",
  UNSANITIZED_READLINE = "error-unsanitized-readline",
  UNSANITIZED_STRING_CONCAT_1 = "error-unsanitized-string-concat-1",
  UNSANITIZED_STRING_CONCAT_2 = "error-unsanitized-string-concat-2",
  UNSANITIZED_STRING_CONCAT_3 = "error-unsanitized-string-concat-3",
  UNSANITIZED_STRING_CONCAT_4 = "error-unsanitized-string-concat-4",
  UNSANITIZED_STRING_CONCAT_5 = "error-unsanitized-string-concat-5",
  UNSANITIZED_UNSAFE_VARIABLE_1 = "error-unsanitized-unsafe-variable-1",
  UNSANITIZED_UNSAFE_VARIABLE_2 = "error-unsanitized-unsafe-variable-2",
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

ruleTester.run("pg/no-sql-injections", pgNoSQLInjections, {
  valid: [
    getCode(__dirname, validTests.CALLBACK),
    getCode(__dirname, validTests.PREPARED_STATEMENTS),
    getCode(__dirname, validTests.PROMISE),
    getCode(__dirname, validTests.PROMISE_QUERY),
  ],
  invalid: [
    {
      ...getCode(__dirname, invalidTests.ASYNC_FUNCTION_CALL),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      ...getCode(__dirname, invalidTests.UNSANITIZED_READLINE),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      ...getCode(__dirname, invalidTests.UNSANITIZED_STRING_CONCAT_1),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      ...getCode(__dirname, invalidTests.UNSANITIZED_STRING_CONCAT_2),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      ...getCode(__dirname, invalidTests.UNSANITIZED_STRING_CONCAT_3),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      ...getCode(__dirname, invalidTests.UNSANITIZED_STRING_CONCAT_4),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      ...getCode(__dirname, invalidTests.UNSANITIZED_STRING_CONCAT_5),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      ...getCode(__dirname, invalidTests.UNSANITIZED_UNSAFE_VARIABLE_1),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      ...getCode(__dirname, invalidTests.UNSANITIZED_UNSAFE_VARIABLE_2),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
  ],
});
