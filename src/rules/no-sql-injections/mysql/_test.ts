import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";
import { MessageIds } from "../_utils/messages";

import { mysqlNoSQLInjections } from "./_rule";

enum validTests {
  ADVANCED_QUERY_PARAMETERIZED_ARGS_1 = "allow-advanced-query-parameterized-args-1",
  ADVANCED_QUERY_PARAMETERIZED_ARGS_2 = "allow-advanced-query-parameterized-args-2",
  IMPORT_STATEMENTS = "allow-import-statements",
  OTHER_QUERY_LANG = "allow-other-query-lang",
  PARAMTERIZED_UNSAFE_VALUE = "allow-paramterized-unsafe-value",
  QUERY_STRING_NO_ARGS = "allow-query-string-no-args",
  QUERY_STRING_PARAMETERIZED_ARGS_1 = "allow-query-string-parameterized-args-1",
  QUERY_STRING_PARAMETERIZED_ARGS_2 = "allow-query-string-parameterized-args-2",
  QUERY_STRING_PARAMETERIZED_ARGS_3 = "allow-query-string-parameterized-args-3",
  UNSANITIZED_LOCAL_VARIABLES = "allow-unsanitized-local-variables",
}

enum invalidTests {
  UNSANITIZED_STRING_CONCAT = "error-unsanitized-string-concat",
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

ruleTester.run("mysql/no-sql-injections", mysqlNoSQLInjections, {
  valid: [
    getCode(__dirname, validTests.ADVANCED_QUERY_PARAMETERIZED_ARGS_1),
    getCode(__dirname, validTests.ADVANCED_QUERY_PARAMETERIZED_ARGS_2),
    getCode(__dirname, validTests.IMPORT_STATEMENTS),
    getCode(__dirname, validTests.OTHER_QUERY_LANG),
    getCode(__dirname, validTests.QUERY_STRING_NO_ARGS),
    getCode(__dirname, validTests.QUERY_STRING_PARAMETERIZED_ARGS_1),
    getCode(__dirname, validTests.QUERY_STRING_PARAMETERIZED_ARGS_2),
    getCode(__dirname, validTests.QUERY_STRING_PARAMETERIZED_ARGS_3),
    getCode(__dirname, validTests.UNSANITIZED_LOCAL_VARIABLES),
  ],
  invalid: [
    {
      ...getCode(__dirname, invalidTests.UNSANITIZED_STRING_CONCAT),
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
