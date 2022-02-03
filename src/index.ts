import { noDomXSSRule } from "./rules/browser/no-dom-xss/_rule";

export const rules = {
  "browser/no-dom-xss": noDomXSSRule,
};

export const configs = {
  recommended: {
    extends: ["plugin:security-rules/browser"],
    plugins: ["security-rules"],

    overrides: [
      {
        files: ["*.ts", "*.tsx"],
        parserOptions: {
          project: "./tsconfig.json",
          tsconfigRootDir: process.cwd(),
          createDefaultProgram: true,
        },
      },
    ],
  },
  browser: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/browser/no-dom-xss": ["error"],
    },
  },
};
