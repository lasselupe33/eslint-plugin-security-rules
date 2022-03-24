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

    getCode(__dirname, "array/access-invalid"),
    getCode(__dirname, "array/access-variable"),
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

    getCode(__dirname, "function/arrow-function-call"),
    getCode(__dirname, "function/function-declaration-call"),
    getCode(__dirname, "function/function-expression-call"),
    getCode(__dirname, "function/iife"),
    getCode(__dirname, "function/generator"),
    getCode(__dirname, "function/first-class"),
    getCode(__dirname, "function/tagged-template-expression"),
    getCode(__dirname, "function/rest-simple"),
    getCode(__dirname, "function/rest-complex"),
    getCode(__dirname, "function/rest-unindexed"),
    getCode(__dirname, "function/nested-call"),
    getCode(__dirname, "function/chained-call"),
    getCode(__dirname, "function/scope-1"),
    getCode(__dirname, "function/scope-2"),
    getCode(__dirname, "function/parameter-simple"),
    getCode(__dirname, "function/parameter-multiple"),
    getCode(__dirname, "function/parameter-nested"),
    getCode(__dirname, "function/parameter-array-destructure"),
    getCode(__dirname, "function/parameter-object-destructure"),
    getCode(__dirname, "function/parameter-complex-destructure"),
    getCode(__dirname, "function/return-simple"),
    getCode(__dirname, "function/return-multiple"),
    getCode(__dirname, "function/return-using-override"),
  ],
  invalid: [],
});
