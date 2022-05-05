import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { extractIdentifier } from "../../../utils/ast/extract-identifier";
import { isPackage } from "../../../utils/ast/is-package";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { errorMessages, MessageIds } from "../_utils/messages";

import { checkArgumentsForPassword } from "./utils/check-arguments-for-password";
import { extractObjectProperties } from "./utils/extract-object-properties";

/**
 * Progress
 *  [-] Detection
 *    - [ ] Detection of URI connection strings
 *    - [ ] Detection of hardcoded SSL options
 *  [/] Automatic fix / Suggestions
 *  [x] Reduction of false positives
 *  [-] Fulfilling unit testing
 *  [x] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

export type HandlingContext = {
  ruleContext: Readonly<TSESLint.RuleContext<MessageIds, never[]>>;
};

const createRule = RuleCreator(resolveDocsRoute);

export const mysqlNoHardcodedCredentials = createRule<never[], MessageIds>({
  name: "no-hardcoded-credentials/mysql",
  defaultOptions: [],
  meta: {
    type: "problem",
    messages: errorMessages,
    docs: {
      recommended: "error",
      description: "Disallow hardcoded passwords",
    },
    schema: {},
  },

  create: (context) => {
    return {
      CallExpression: (node) => {
        const identifiers = extractIdentifier(node);
        const id = identifiers[identifiers.length - 1];

        const didMatchIdentifierName =
          id?.name === "createConnection" || id?.name === "createPool";

        if (!didMatchIdentifierName || !isPackage(context, "mysql", id)) {
          return;
        }

        const properties = extractObjectProperties(node);
        checkArgumentsForPassword({ ruleContext: context }, properties);
        // TODO: Unhandled connectionURI
      },
    };
  },
});

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
