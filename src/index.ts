import { noDomXSSRule } from "./rules/browser/xss/no-dom-xss";

export const rules = {
  "browser/no-dom-xss": noDomXSSRule,
};

export const configs = {
  recommended: {
    extends: ["plugin:security-rules/browser"],
    plugins: ["security-rules"],
  },
  browser: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/browser/no-dom-xss": ["error"],
    },
  },
};
