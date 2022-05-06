import { TSESLint } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import {
  isIdentifier,
  isObjectExpression,
  isProperty,
} from "../../../utils/ast/guards";
import { isPackage } from "../../../utils/ast/is-package";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { isSafeValue } from "../_utils/is-safe-value";
import { MessageIds, errorMessages } from "../_utils/messages";

import { extractPGConfig } from "./utils/extract-pg-config";

/**
 * Progress
 *  [x] Detection
 *  [/] Automatic fix / Suggestions
 *  [x] Reduction of false positives
 *  [x] Fulfilling unit testing
 *  [x] Extensive documentation
 *  [/] Fulfilling configuration options
 */

export type HandlingContext = {
  ruleContext: Readonly<TSESLint.RuleContext<MessageIds, never[]>>;
};

const createRule = RuleCreator(resolveDocsRoute);

export const pgNoHardcodedCredentials = createRule<never[], MessageIds>({
  name: "no-hardcoded-credentials/pg",
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
        const argNode = extractPGConfig({ ruleContext: context }, arg);

        // @TODO: Handle literal (URI expressions)
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
});
