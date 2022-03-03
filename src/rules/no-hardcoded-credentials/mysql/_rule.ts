import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { extractIdentifier } from "../utils/extract-identifier";

import { handleIdentifier } from "./handlers/handle-identifier";
import { checkArgumentsForPassword } from "./utils/check-arguments-for-password";
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
  HARDCODED_CREDENTIAL = "hardcoded-credentail",
}

export const mysqlNoHardcodedCredentials: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "problem",
    messages: {
      [MessageIds.HARDCODED_CREDENTIAL]:
        "Credentials shouldn't be hardcoded into {{ id }}.",
    },
    docs: {
      recommended: "error",
      description: "disallow hardcoded passwords",
      url: resolveDocsRoute(__dirname),
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

export function report(
  id: TSESTree.Identifier,
  node: TSESTree.Node,
  ctx: HandlingContext
) {
  ctx.ruleContext.report({
    node,
    messageId: MessageIds.HARDCODED_CREDENTIAL,
    data: { id: id.name },
  });
}
