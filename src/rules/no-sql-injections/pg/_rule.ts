/**
 * Progress
 *  [ ] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

import { TSESLint } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { MessageIds, errorMessages } from "../utils/messages";

export type HandlingContext = {
  ruleContext: Readonly<TSESLint.RuleContext<MessageIds, unknown[]>>;
};

const createRule = RuleCreator(resolveDocsRoute);

export const pgNoSQLInjections = createRule<never[], MessageIds>({
  name: "pg/no-sql-injections",
  defaultOptions: [],
  meta: {
    type: "problem",
    fixable: "code",
    messages: errorMessages,
    docs: {
      recommended: "error",
      description: "Description",
      suggestion: true,
    },
    hasSuggestions: true,
    schema: {},
  },
  create: (context) => {
    return {
      CallExpression: (node) => {
        // No op
      },
    };
  },
});
