/**
 * Progress
 *  [x] Detection
 *  [x] Automatic fix / Suggestions
 *  [-] Reduction of false positives
 *  [-] Fulfilling unit testing
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
import { extractIdentifier } from "../../../utils/extract-identifier";
import { isPackage } from "../../../utils/is-package";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { MessageIds, errorMessages } from "../utils/messages";

import { countPlaceholders } from "./utils/count-placeholders";
import { extractValuesArray } from "./utils/extract-values-array";
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

        if (
          !didMatchIdentifierName ||
          !queryArgs ||
          !isPackage(context, "pg", idLeft)
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
          if (!isArrowFunctionExpression(queryValues) && queryValues) {
            valuesArray = extractValuesArray(
              { ruleContext: context },
              queryValues
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
/**
 * Fixes the unsafe query by replacing the unsafe value with a placeholder
 * string, and moving the unsafe value into an array.
 * @param ctx The context of the linted file
 * @param fixer A fixer from the report function
 * @param totalPlaceholders The total amount of placeholders so far in the query
 * @param queryNode The node containing the query.
 * @param objNode Optional: The node containing the object expression
 * @param arrayNode Optional: If arrayNode exists. If totalPlaceholders are
 * larger than one, this is required.
 * @param replaceNode The unsafe value that is to be paramterized.
 */
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

  if (totalPlaceholders > 0 && !arrayNode) {
    return;
  }

  const nodeText = ctx.ruleContext.getSourceCode().getText(replaceNode);

  // Parameterization
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
    const rangeStart = objNode.range[1] - 1;
    yield fixer.insertTextBeforeRange(
      [rangeStart, 0],
      ", values: [" + nodeText + "] "
    );
  }
  // Existing placeholder array
  else if (arrayNode) {
    const rangeEnd = arrayNode.range[1] - 1;
    yield fixer.insertTextAfterRange([0, rangeEnd], ", " + nodeText);
  }
}
