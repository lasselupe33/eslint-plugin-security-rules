import { noDomXSSRule } from "./rules/no-dom-xss/browser/_rule";
import { mysqlNoHardcodedCredentials } from "./rules/no-hardcoded-credentials/mysql/_rule";
import { uniNoHardcodedCredentials } from "./rules/no-hardcoded-credentials/universal/_rule";
import { mysqlNoSQLInjections } from "./rules/no-sql-injections/mysql/_rule";

export const rules = {
  "browser/no-dom-xss": noDomXSSRule,
  "universal/no-hc-credentials": uniNoHardcodedCredentials,
  "mysql/no-hardcoded-credentials": mysqlNoHardcodedCredentials,
  "mysql/no-sql-injections": mysqlNoSQLInjections,
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
      "security-rules/mysql/no-sql-injections": ["error"],
    },
  },
};
