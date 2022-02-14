import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { handleIdentifier } from "./handlers/handle-identifier";
import { extractIdentifier } from "./utils/extract-identifier";

/**
 * Progress
 *  [ ] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

export type HandlingContext = {
  ruleContext: Readonly<TSESLint.RuleContext<MessageIds, []>>;
};

enum MessageIds {
  ERROR1 = "error1",
}

export const noHardcodedCredentials: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "problem",
    messages: {
      [MessageIds.ERROR1]: "The query is vulnerable to SQL injections",
    },
    docs: {
      recommended: "error",
      description: "Description",
    },
    schema: {},
  },

  create: (context) => {
    return {
      CallExpression: (node) => {
        const id = extractIdentifier(node);

        const didMatchIdentifierName = handleIdentifier(
          { ruleContext: context },
          id
        );

        if (didMatchIdentifierName) {
          // TODO
        }
      },
    };
  },
};

export function report(node: TSESTree.Node, ctx: HandlingContext) {
  ctx.ruleContext.report({
    node,
    messageId: MessageIds.ERROR1,
    data: { node },
  });
}
