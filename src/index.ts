import { limitSingleLineCommentsRule } from "./rules/limit-single-line-comments";

export const rules = {
  "limit-single-line-comments": limitSingleLineCommentsRule,
};

export const configs = {
  recommended: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/limit-single-line-comments": ["warn", 60],
    },
  },
};
