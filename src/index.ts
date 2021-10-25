import { limitSingleLineCommentsRule } from "./rules/limit-single-line-comments";
import { multiFileRule } from "./rules/multi-file-rule";

export const rules = {
  "limit-single-line-comments": limitSingleLineCommentsRule,
  "multi-file-rule": multiFileRule,
};

export const configs = {
  recommended: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/limit-single-line-comments": ["warn", 60],
      "security-rules/multi-file-rule": ["warn"],
    },
  },
};
