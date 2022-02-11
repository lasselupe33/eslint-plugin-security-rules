import { noDomXSSRule } from "./rules/no-dom-xss/browser/_rule";
import { noHardcodedCredentials } from "./rules/no-hardcoded-credentials/mysql/_rule";
import { noHcCredentials } from "./rules/no-hardcoded-credentials/universal/_rule";

export const rules = {
  "browser/no-dom-xss": noDomXSSRule,
  "universal/no-hc-credentials": noHcCredentials,
  "mysql/no-hardcoded-credentials": noHardcodedCredentials,
};

export const configs = {
  recommended: {
    extends: [
      "plugin:security-rules/browser",
      "plugin:security-rules/universal",
      "plugin:security-rules/mysql",
    ],
    plugins: ["security-rules"],

    overrides: [
      {
        files: ["*.ts", "*.tsx"],
        // parserOptions: {
        //   project: "./tsconfig.json",
        //   tsconfigRootDir: process.cwd(),
        // },
      },
    ],
  },
  browser: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/browser/no-dom-xss": ["error"],
    },
  },
  universal: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/universal/no-hc-credentials": ["error"],
    },
  },
  mysql: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/mysql/no-hardcoded-credentials": ["error"],
    },
  },
};
