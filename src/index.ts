import { multiFileRule } from "./rules/multi-file-rule";

export const rules = {
  "multi-file-rule": multiFileRule,
};

export const configs = {
  recommended: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/multi-file-rule": ["warn"],
    },
  },
};
