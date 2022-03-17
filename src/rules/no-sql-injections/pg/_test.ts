import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";
import { MessageIds } from "../utils/messages";

import { pgNoSQLInjections } from "./_rule";

enum validTests {
  CALLBACK = "allow-callback",
  PREPARED_STATEMENTS = "allow-prepared-statement",
  PROMISE_QUERY = "allow-promise-query",
  PROMISE = "allow-promise",
}

enum invalidTests {
  UNSANITIZED_STRING_CONCAT_1 = "error-unsanitized-string-concat-1",
  UNSANITIZED_STRING_CONCAT_2 = "error-unsanitized-string-concat-2",
  UNSANITIZED_STRING_CONCAT_3 = "error-unsanitized-string-concat-3",
  UNSANITIZED_STRING_CONCAT_4 = "error-unsanitized-string-concat-4",
  UNSANITIZED_STRING_CONCAT_5 = "error-unsanitized-string-concat-5",
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
    {
      code: getCode(__dirname, validTests.CALLBACK),
    },
    {
      code: getCode(__dirname, validTests.PREPARED_STATEMENTS),
    },
    {
      code: getCode(__dirname, validTests.PROMISE),
    },
    {
      code: getCode(__dirname, validTests.PROMISE_QUERY),
    },
  ],
  invalid: [
    {
      code: getCode(__dirname, invalidTests.UNSANITIZED_STRING_CONCAT_1),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      code: getCode(__dirname, invalidTests.UNSANITIZED_STRING_CONCAT_2),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      code: getCode(__dirname, invalidTests.UNSANITIZED_STRING_CONCAT_3),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      code: getCode(__dirname, invalidTests.UNSANITIZED_STRING_CONCAT_4),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
    {
      code: getCode(__dirname, invalidTests.UNSANITIZED_STRING_CONCAT_5),
      errors: [{ messageId: MessageIds.VULNERABLE_QUERY }],
    },
  ],
});
