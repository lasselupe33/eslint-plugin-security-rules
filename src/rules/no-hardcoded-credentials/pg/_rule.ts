import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
  isIdentifier,
  isObjectExpression,
  isProperty,
} from "../../../utils/ast/guards";
import { isPackage } from "../../../utils/is-package";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { isSafeValue } from "../utils/is-safe-value";

import { handleArgs } from "./handlers/handleArgs";
import { MessageIds, errorMessages } from "./utils/messages";

/**
 * Progress
 *  [x] Detection
 *  [ ] Automatic fix / Suggestions -- Can't be implemented?
 *  [x] Reduction of false positives
 *  [x] Fulfilling unit testing
 *  [x] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

export type HandlingContext = {
  ruleContext: Readonly<TSESLint.RuleContext<MessageIds, []>>;
};

export const pgNoHardcodedCredentials: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "problem",
    messages: errorMessages,
    docs: {
      recommended: "error",
      description: "disallow hardcoded passwords",
      url: resolveDocsRoute(__dirname),
    },
    schema: {},
  },

  create: (context) => {
    return {
      NewExpression: (node) => {
        // If the Client has no arguments, it uses process env and is therefore
        // deemed safe for use.
        if (!isIdentifier(node.callee) || !node.arguments[0]) {
          return;
        }

        const id = node.callee;
        const didMatchIdentifierName =
          id.name === "Client" || id.name === "Pool";

        if (!didMatchIdentifierName || !isPackage(context, "pg", id)) {
          return;
        }

        const arg = node.arguments[0];
        const argNode = handleArgs({ ruleContext: context }, arg);

        // @TODO: Handle literal
        if (!argNode) {
          return;
        }

        if (isObjectExpression(argNode)) {
          for (const property of argNode.properties) {
            if (
              !isProperty(property) ||
              !isIdentifier(property.key) ||
              !(property.key.name === "password")
            ) {
              continue;
            }
            if (!isSafeValue(context, property.value)) {
              context.report({
                node: property,
                data: { id: property.key.name },
                messageId: MessageIds.HARDCODED_CREDENTIAL,
              });
            }
          }
        }
      },
    };
  },
};
