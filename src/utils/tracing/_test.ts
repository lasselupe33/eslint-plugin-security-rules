import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../testing/get-code";

import { traceTestRule } from "./_rule";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: path.resolve(__dirname, "..", "..", ".."),
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run("tracing/test", traceTestRule, {
  valid: [
    getCode(__dirname, "reassign"),

    getCode(__dirname, "array/simple"),
    getCode(__dirname, "array/nested"),
    getCode(__dirname, "array/spread-simple"),
    getCode(__dirname, "array/spread-invalid"),
    getCode(__dirname, "array/complex-1"),
    getCode(__dirname, "array/complex-2"),

    getCode(__dirname, "expression/unary"),
    getCode(__dirname, "expression/binary"),
    getCode(__dirname, "expression/logical"),
    getCode(__dirname, "expression/sequence"),

    getCode(__dirname, "object/simple"),
    getCode(__dirname, "object/nested"),
    getCode(__dirname, "object/rest-inline"),
    getCode(__dirname, "object/rest-overwrite"),
    getCode(__dirname, "object/rest-simple"),
    getCode(__dirname, "object/without-path"),
  ],
  invalid: [],
});
