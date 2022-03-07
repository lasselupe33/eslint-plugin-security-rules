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
  isArrowFunctionExpression,
  isProperty,
} from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { extractIdentifier } from "../utils/extract-identifier";
import { MessageIds, errorMessages } from "../utils/messages";

import { countPlaceholders } from "./utils/count-placeholders";
import { extractValuesArray } from "./utils/extract-values-array";
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

        let [isCurrentQuerySafe, maybeNode, maybeQuery] = isQuerySafe(
          { ruleContext: context },
          queryArgs
        );

        let valuesArray: TSESTree.ArrayExpression | undefined = undefined;
        const objNode = isObjectExpression(maybeNode) ? maybeNode : undefined;
        // Handle the specific case, where the query is stored in an object
        if (isObjectExpression(maybeNode)) {
          for (const property of maybeNode.properties) {
            if (isProperty(property) && isIdentifier(property.key)) {
              if (property.key.name === "text") {
                [isCurrentQuerySafe, maybeNode, maybeQuery] = isQuerySafe(
                  { ruleContext: context },
                  property.value
                );
              } else if (property.key.name === "values") {
                valuesArray = extractValuesArray(
                  { ruleContext: context },
                  property.value
                );
              }
            }
          }
        }

        // Bail out early
        if (isCurrentQuerySafe || !maybeNode) {
          return;
        }

        if (!valuesArray) {
          const queryValues = idRight?.parent?.parent.arguments[1];
          if (!isArrowFunctionExpression(queryValues)) {
            valuesArray = extractValuesArray(
              { ruleContext: context },
              queryArgs
            );
          }
        }
        const totalPlaceholders = countPlaceholders(maybeQuery);

        context.report({
          node: maybeNode,
          messageId: MessageIds.VULNERABLE_QUERY,
          data: { maybeNode },
          suggest: [
            {
              messageId: MessageIds.PARAMTERIZED_FIX_VALUES,
              fix: (fixer: TSESLint.RuleFixer) =>
                paramterizeQueryFix(
                  { ruleContext: context },
                  fixer,
                  totalPlaceholders,
                  node,
                  objNode,
                  valuesArray,
                  maybeNode
                ),
            },
          ],
        });
      },
    };
  },
});

function* paramterizeQueryFix(
  ctx: HandlingContext,
  fixer: TSESLint.RuleFixer,
  totalPlaceholders: number,
  queryNode: TSESTree.CallExpression,
  objNode?: TSESTree.ObjectExpression,
  arrayNode?: TSESTree.ArrayExpression,
  replaceNode?: TSESTree.Node
): Generator<TSESLint.RuleFix> {
  const queryLocation = queryNode.arguments[0];
  if (!replaceNode || !queryLocation) {
    return;
  }
  const nodeText = ctx.ruleContext.getSourceCode().getText(replaceNode);

  yield fixer.replaceText(
    replaceNode,
    '"$' + (totalPlaceholders + 1).toString() + '"'
  );

  // No array and not in an object
  if (!arrayNode && !objNode) {
    yield fixer.insertTextAfter(queryLocation, ", [" + nodeText + "]");
  }
  // No array and in an object
  else if (!arrayNode && objNode) {
    yield fixer.insertTextBeforeRange(
      [objNode.range[1] - 1, 0],
      ", values: [" + nodeText + "] "
    );
  }
  // Existing placeholder array and not in an object
  else if (arrayNode && !objNode) {
    // No op
  }
  // Existing placeholder array and in an object
  else if (arrayNode && objNode) {
    // No op
  }
}
