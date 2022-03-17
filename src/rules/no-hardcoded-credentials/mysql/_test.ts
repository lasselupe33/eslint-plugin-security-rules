import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";

import { mysqlNoHardcodedCredentials, MessageIds } from "./_rule";

enum validTests {
  CREATECONNECTION_HARDCODED_EMPTY_PASSWORD = "allow-createconnection-hardcoded-empty-password",
  CREATECONNECTION_PROCESS_ENV = "allow-createconnection-process-env",
  FILE_SSL_CONNECTION = "allow-file-ssl-connection",
  NAMESPACE_CREATECONNECTION = "allow-namespace-createConnection",
}

enum invalidTests {
  CREATECONNECTION_HARDCODED_PASSWORD = "error-createconnection-hardcoded-password",
  CREATEPOOL_HARDCODED_PASSWORD = "error-createpool-hardcoded-password",
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

ruleTester.run("mysql/no-hardcoded-credentials", mysqlNoHardcodedCredentials, {
  valid: [
    {
      code: getCode(
        __dirname,
        validTests.CREATECONNECTION_HARDCODED_EMPTY_PASSWORD
      ),
    },
    {
      code: getCode(__dirname, validTests.CREATECONNECTION_PROCESS_ENV),
    },
    {
      code: getCode(__dirname, validTests.FILE_SSL_CONNECTION),
    },
    {
      code: getCode(__dirname, validTests.NAMESPACE_CREATECONNECTION),
    },
  ],
  invalid: [
    {
      code: getCode(
        __dirname,
        invalidTests.CREATECONNECTION_HARDCODED_PASSWORD
      ),
      errors: [{ messageId: MessageIds.HARDCODED_CREDENTIAL }],
    },
    {
      code: getCode(__dirname, invalidTests.CREATEPOOL_HARDCODED_PASSWORD),
      errors: [{ messageId: MessageIds.HARDCODED_CREDENTIAL }],
    },
  ],
});
