import { dependenciesRule } from "./rules/dependencies-rule";
import { multiFileRule } from "./rules/multi-file-rule";

export const rules = {
  "multi-file-rule": multiFileRule,
  "dependencies-rule": dependenciesRule,
};

export const configs = {
  recommended: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/multi-file-rule": ["warn"],
      // "security-rules/dependencies-rule": ["warn"],
    },
  },
};
