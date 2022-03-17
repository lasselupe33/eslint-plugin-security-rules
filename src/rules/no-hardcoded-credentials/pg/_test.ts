import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";

import { pgNoHardcodedCredentials } from "./_rule";
import { MessageIds } from "./utils/messages";

enum validTests {
  CREATECLIENT_EMPTY = "allow-createclient-empty",
  CREATEPOOL_EMPTY = "allow-createpool-empty",
  FILE_SSL_CONNECTION = "allow-file-ssl-connection",
}

enum invalidTests {
  CREATECLIENT_HARDCODED_PASSWORD_IDENTIFIER = "error-createclient-hardcoded-password-identifier",
  CREATECLIENT_HARDCODED_PASSWORD = "error-createclient-hardcoded-password",
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

ruleTester.run("pg/no-hardcoded-credentials", pgNoHardcodedCredentials, {
  valid: [
    getCode(__dirname, validTests.CREATECLIENT_EMPTY),
    getCode(__dirname, validTests.CREATEPOOL_EMPTY),
    getCode(__dirname, validTests.FILE_SSL_CONNECTION),
  ],
  invalid: [
    {
      ...getCode(
        __dirname,
        invalidTests.CREATECLIENT_HARDCODED_PASSWORD_IDENTIFIER
      ),
      errors: [{ messageId: MessageIds.HARDCODED_CREDENTIAL }],
    },
    {
      ...getCode(__dirname, invalidTests.CREATECLIENT_HARDCODED_PASSWORD),
      errors: [{ messageId: MessageIds.HARDCODED_CREDENTIAL }],
    },
    {
      ...getCode(__dirname, invalidTests.CREATEPOOL_HARDCODED_PASSWORD),
      errors: [{ messageId: MessageIds.HARDCODED_CREDENTIAL }],
    },
  ],
});
