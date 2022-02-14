import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { handleIdentifier } from "./handlers/handle-identifier";
import { checkArgumentsForPassword } from "./utils/check-arguments-for-password";
import { extractIdentifier } from "./utils/extract-identifier";
import { extractObjectProperties } from "./utils/extract-object-properties";

// TODO : Check on AST properties instead of only type properties

/**
 * Progress
 *  [-] Detection
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
      [MessageIds.ERROR1]: "Credentials shouldn't be hardcoded into a file.",
    },
    docs: {
      recommended: "error",
      description:
        "It is recommended to use a secret manager, such as Google Secret Manager, or use process.env \nprocess.env may still reveal secrets in a stack trace ",
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
          const properties = extractObjectProperties(node);
          checkArgumentsForPassword({ ruleContext: context }, properties);
          // TODO: Unhandled connectionURI
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
