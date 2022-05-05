import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { extractIdentifier } from "../../../utils/ast/extract-identifier";
import {
  isIdentifier,
  isObjectExpression,
  isArrowFunctionExpression,
  isProperty,
  isTemplateLiteral,
} from "../../../utils/ast/guards";
import { isPackage } from "../../../utils/ast/is-package";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { extractValuesArray } from "../_utils/extract-values-array";
import { MessageIds, errorMessages } from "../_utils/messages";

import { countPlaceholders } from "./utils/count-placeholders";
import { isQuerySafe } from "./utils/is-query-safe";

/**
 * Progress
 *  [x] Detection
 *  [x] Automatic fix / Suggestions
 *  [-] Reduction of false positives
 *  [-] Fulfilling unit testing
 *  [x] Extensive documentation
 *  [/] Fulfilling configuration options
 */

export type HandlingContext = {
  ruleContext: Readonly<TSESLint.RuleContext<MessageIds, unknown[]>>;
};

const createRule = RuleCreator(resolveDocsRoute);

export const pgNoSQLInjections = createRule<never[], MessageIds>({
  name: "no-sql-injections/pg",
  defaultOptions: [],
  meta: {
    type: "problem",
    fixable: "code",
    messages: errorMessages,
    docs: {
      recommended: "error",
      description: "Detects possible SQL injections in PostgreSQL queries",
      suggestion: true,
    },
    hasSuggestions: true,
    schema: {},
  },
  create: (context) => {
    return {
      CallExpression: (node: TSESTree.CallExpression) => {
        const identifiers = extractIdentifier(node);
        const idRight = identifiers[identifiers.length - 1];

        if (!idRight) {
          return;
        }

        const didMatchIdentifierName = idRight.name === "query";
        const queryArgs = node.arguments[0];

        if (
          !didMatchIdentifierName ||
          !queryArgs ||
          !isPackage(context, "pg", node)
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
          // @TODO: Check to see if text exist in object - is this the right
          // place to do so?
          if (
            !objNode?.properties.some(
              (it) =>
                isProperty(it) && isIdentifier(it.key) && it.key.name === "text"
            )
          ) {
            return;
          }

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

        if (isCurrentQuerySafe || !maybeNode) {
          return;
        }

        // If not extracted in object, we need to extract it now
        if (!valuesArray) {
          const queryValues = node.arguments[1];
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
                paramterizeQueryFix(context, fixer, {
                  totalPlaceholders,
                  queryNode: node,
                  objNode,
                  placeholderValuesNode: valuesArray,
                  unsafeNode: maybeNode,
                }),
            },
          ],
        });
      },
    };
  },
});

type FixParams = {
  totalPlaceholders: number;
  queryNode: TSESTree.CallExpression;
  objNode?: TSESTree.ObjectExpression;
  placeholderValuesNode?: TSESTree.ArrayExpression;
  unsafeNode?: TSESTree.Node;
};

/**
 * Fixes the unsafe query by replacing the unsafe value with a placeholder
 * string, and moving the unsafe value into an array.
 */
function* paramterizeQueryFix(
  ctx: Readonly<TSESLint.RuleContext<MessageIds, unknown[]>>,
  fixer: TSESLint.RuleFixer,
  {
    totalPlaceholders,
    queryNode,
    objNode,
    placeholderValuesNode,
    unsafeNode,
  }: FixParams
): Generator<TSESLint.RuleFix> {
  const queryLocation = queryNode.arguments[0];

  if (!unsafeNode || !queryLocation) {
    return;
  }

  if (totalPlaceholders > 0 && !placeholderValuesNode) {
    return;
  }

  const nodeText = ctx.getSourceCode().getText(unsafeNode);

  // Parameterization
  const [startR, endR] = unsafeNode.range;
  // If node is of the form ${adr}, we need to strip the ${}
  if (isTemplateLiteral(unsafeNode.parent)) {
    yield fixer.replaceTextRange(
      [startR - 2, endR + 1],
      `$${totalPlaceholders + 1}`
    );
  } else {
    yield fixer.replaceTextRange([startR, endR], `"$${totalPlaceholders + 1}"`);
  }

  // No array and not in an object
  // Create a new array for placeholder values
  if (!placeholderValuesNode && !objNode) {
    yield fixer.insertTextAfter(queryLocation, ", [" + nodeText + "]");
  }
  // No array and in an object
  // Create a new array for placeholder values in the object
  else if (!placeholderValuesNode && objNode) {
    const rangeStart = objNode.range[1] - 1;
    yield fixer.insertTextBeforeRange(
      [rangeStart, 0],
      ", values: [" + nodeText + "] "
    );
  }
  // Existing placeholder array and existing element
  // Overwrite the existing value on the placeholder spot
  else if (
    placeholderValuesNode &&
    placeholderValuesNode.elements.length > totalPlaceholders
  ) {
    const overwriteNode = placeholderValuesNode.elements[totalPlaceholders];
    if (overwriteNode) {
      yield fixer.replaceText(overwriteNode, nodeText);
    }
  }
  // Existing placeholder array
  // Append to the end of the array
  else if (placeholderValuesNode) {
    const rangeEnd = placeholderValuesNode.range[1] - 1;
    yield fixer.insertTextAfterRange([0, rangeEnd], ", " + nodeText);
  }
}
