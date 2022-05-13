import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";

import { nodeNoInsecureCiphers } from "./_rule";
import { MessageIds } from "./utils/messages";

enum validTests {
  SECURE_ALG = "allow-secure-alg",
  UNKNOWN_ALG = "allow-unknown-alg",
}

enum invalidTests {
  AES_128_ECB = "error-aes-128-ecb",
  CAPITALIZED_ALG_NAME = "error-capitalized-alg-name",
  DES = "error-des",
  RENAMED_FUNCTION = "error-renamed-function",
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

ruleTester.run("node/no-insecure-ciphers", nodeNoInsecureCiphers, {
  valid: [
    getCode(__dirname, validTests.SECURE_ALG),
    getCode(__dirname, validTests.UNKNOWN_ALG),
  ],
  invalid: [
    {
      ...getCode(__dirname, invalidTests.AES_128_ECB),
      errors: [{ messageId: MessageIds.INSECURE_CIPHER }],
    },
    {
      ...getCode(__dirname, invalidTests.CAPITALIZED_ALG_NAME),
      errors: [{ messageId: MessageIds.INSECURE_CIPHER }],
    },
    {
      ...getCode(__dirname, invalidTests.DES),
      errors: [{ messageId: MessageIds.INSECURE_CIPHER }],
    },
    {
      ...getCode(__dirname, invalidTests.RENAMED_FUNCTION),
      errors: [{ messageId: MessageIds.INSECURE_CIPHER }],
    },
  ],
});
