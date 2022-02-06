import { noDomXSSRule } from "./rules/browser/no-dom-xss/_rule";
import { noHcCredentials } from "./rules/universal/no-hc-credentials/_rule";

export const rules = {
  "browser/no-dom-xss": noDomXSSRule,
  "universal/no-hc-credentials": noHcCredentials,
};

export const configs = {
  recommended: {
    extends: [
      "plugin:security-rules/browser",
      "plugin:security-rules/universal",
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
};
