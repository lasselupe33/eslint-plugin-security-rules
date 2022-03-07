/**
 * Progress
 *  [-] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import {
  isCallExpression,
  isIdentifier,
  isObjectExpression,
  isProperty,
} from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { extractIdentifier } from "../utils/extract-identifier";
import { MessageIds, errorMessages } from "../utils/messages";

import { isPGPackage } from "./utils/is-pg-package";
import { isQuerySafe } from "./utils/is-query-safe";

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
      // Called on all ExpressionStatements with CallExpression
      ["ExpressionStatement > CallExpression"]: (
        node: TSESTree.CallExpression
      ) => {
        const [idLeft, idRight] = extractIdentifier(node);
        if (
          !idRight?.parent?.parent ||
          !isCallExpression(idRight.parent.parent)
        ) {
          return;
        }

        const didMatchIdentifierName = idRight?.name === "query";
        const queryArgs = idRight?.parent?.parent.arguments[0];

        // @TODO: Check that we're using the PG package by tracing idLeft
        if (
          !didMatchIdentifierName ||
          !queryArgs ||
          !isPGPackage({ ruleContext: context }, idLeft)
        ) {
          return;
        }

        let [isCurrentQuerySafe, maybeNode] = isQuerySafe(
          { ruleContext: context },
          queryArgs
        );

        // Handle the specific case, where the query is stored in a obj text
        if (isObjectExpression(maybeNode)) {
          for (const property of maybeNode.properties) {
            if (
              isProperty(property) &&
              isIdentifier(property.key) &&
              property.key.name === "text"
            ) {
              [isCurrentQuerySafe, maybeNode] = isQuerySafe(
                { ruleContext: context },
                property.value
              );
              break;
            }
          }
        }

        if (!isCurrentQuerySafe && maybeNode) {
          context.report({
            node: maybeNode,
            messageId: MessageIds.VULNERABLE_QUERY,
            data: { maybeNode },
          });
        }
      },
    };
  },
});
