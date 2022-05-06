import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { extractIdentifier } from "../../../utils/ast/extract-identifier";
import {
  isArrowFunctionExpression,
  isIdentifier,
  isObjectExpression,
  isProperty,
  isTemplateLiteral,
} from "../../../utils/ast/guards";
import { isPackage } from "../../../utils/ast/is-package";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { extractValuesArray } from "../_utils/extract-values-array";
import { MessageIds, errorMessages } from "../_utils/messages";

import { unsafe } from "./tests/config-connection";
import { countPlaceholders } from "./utils/count-placeholders";
import { isQuerySafe } from "./utils/is-query-safe";

/**
 * Progress
 *  [x] Detection
 *  [x] Automatic fix / Suggestions
 *  [x] Reduction of false positives
 *  [-] Fulfilling unit testing
 *  [x] Extensive documentation
 *  [/] Fulfilling configuration options
 */

export type HandlingContext = {
  ruleContext: Readonly<TSESLint.RuleContext<MessageIds, unknown[]>>;
};

const createRule = RuleCreator(resolveDocsRoute);

export const mysqlNoSQLInjections = createRule<never[], MessageIds>({
  name: "no-sql-injections/mysql",
  defaultOptions: [],
  meta: {
    type: "problem",
    fixable: "code",
    messages: errorMessages,
    docs: {
      recommended: "error",
      description: "Detects possible SQL injections in MySQL queries",
      suggestion: true,
    },
    hasSuggestions: true,
    schema: {},
  },
  create: (context) => {
    return {
      CallExpression: (node) => {
        // connection.query | this.connection.query

        const identifiers = extractIdentifier(node);
        const idRight = identifiers[identifiers.length - 1];
        const idsLeft = identifiers.slice(0, -1);
        const escapeIdentifier = idsLeft.map((id) => id.name).join(".");

        const didMatchIdentifierName = idRight?.name === "query";

        // Assuming that query is always the first argument
        const query = node.arguments[0];

        if (
          !didMatchIdentifierName ||
          !(0 < node.arguments.length && node.arguments.length < 4) ||
          !query ||
          !isPackage(context, "mysql", node)
        ) {
          return;
        }

        let valuesArray: TSESTree.ArrayExpression | undefined = undefined;

        let checkRes = isQuerySafe({ ruleContext: context }, query);

        const objNode = isObjectExpression(checkRes.troubleNode)
          ? checkRes.troubleNode
          : undefined;

        // Handle the specific case, where the query is stored in an
        // object
        if (objNode) {
          let foundSql = false;

          for (const property of objNode.properties) {
            if (isProperty(property) && isIdentifier(property.key)) {
              if (property.key.name === "sql") {
                checkRes = isQuerySafe(
                  { ruleContext: context },
                  property.value
                );
                foundSql = true;
              } else if (property.key.name === "values") {
                valuesArray = extractValuesArray(
                  { ruleContext: context },
                  property.value
                );
              }
            }
          }

          if (!foundSql) {
            return;
          }
        }

        if (checkRes.isSafe || !checkRes.troubleNode) {
          return;
        }

        const queryValues = node.arguments[1];

        const totalPlaceholders = countPlaceholders(checkRes.queryUpToNode);

        if (!valuesArray) {
          if (!isArrowFunctionExpression(queryValues) && queryValues) {
            valuesArray = extractValuesArray(
              { ruleContext: context },
              queryValues
            );
          }
        }

        // @TODO: Parameterization fix
        // const totalPlaceholders = countPlaceholders(maybeQuery);

        context.report({
          node: checkRes.troubleNode,
          messageId: MessageIds.VULNERABLE_QUERY,
          data: { maybeNode: checkRes.troubleNode },
          suggest: [
            {
              messageId: MessageIds.PARAMTERIZED_FIX_VALUES,
              fix: (fixer: TSESLint.RuleFixer) =>
                paramterizeQueryFix(
                  { ruleContext: context },
                  fixer,
                  "?",
                  totalPlaceholders,
                  query,
                  objNode,
                  valuesArray,
                  checkRes.troubleNode
                ),
            },
            {
              messageId: MessageIds.PARAMTERIZED_FIX_IDENTIFIERS,
              fix: (fixer: TSESLint.RuleFixer) =>
                paramterizeQueryFix(
                  { ruleContext: context },
                  fixer,
                  "??",
                  totalPlaceholders,
                  query,
                  objNode,
                  valuesArray,
                  checkRes.troubleNode
                ),
            },
            {
              messageId: MessageIds.ESCAPE_FIX_VALUES,
              fix: (fixer: TSESLint.RuleFixer) =>
                escapeQueryValuesFix(
                  fixer,
                  escapeIdentifier,
                  checkRes.troubleNode
                ),
            },
            {
              messageId: MessageIds.ESCAPE_FIX_IDENTIFIERS,
              fix: (fixer: TSESLint.RuleFixer) =>
                escapeQueryIdentifiersFix(
                  fixer,
                  escapeIdentifier,
                  checkRes.troubleNode
                ),
            },
          ],
        });
      },
    };
  },
});

function* escapeQueryValuesFix(
  fixer: TSESLint.RuleFixer,
  escapeIdentifier: string,
  node?: TSESTree.Node
): Generator<TSESLint.RuleFix> {
  if (!node || escapeIdentifier.length === 0) {
    return;
  }

  yield fixer.insertTextBefore(node, escapeIdentifier + ".escape(");
  yield fixer.insertTextAfter(node, ")");
}

function* escapeQueryIdentifiersFix(
  fixer: TSESLint.RuleFixer,
  escapeIdentifier: string,
  node?: TSESTree.Node
): Generator<TSESLint.RuleFix> {
  if (!node || escapeIdentifier.length === 0) {
    return;
  }

  yield fixer.insertTextBefore(node, escapeIdentifier + ".escapeId(");
  yield fixer.insertTextAfter(node, ")");
}

function* paramterizeQueryFix(
  ctx: HandlingContext,
  fixer: TSESLint.RuleFixer,
  escapeIdentifier: string,
  totalPlaceholders: number,
  queryNode: TSESTree.CallExpressionArgument,
  objNode?: TSESTree.ObjectExpression,
  placeholderValuesNode?: TSESTree.ArrayExpression,
  unsafeNode?: TSESTree.Node
): Generator<TSESLint.RuleFix> {
  if (!unsafeNode || escapeIdentifier.length === 0) {
    return;
  }

  if (totalPlaceholders > 0 && !placeholderValuesNode) {
    return;
  }

  // Parameterization
  const [startR, endR] = unsafeNode.range;
  // If node is of the form ${adr}, we need to strip the ${}
  if (isTemplateLiteral(unsafeNode.parent)) {
    yield fixer.replaceTextRange([startR - 2, endR + 1], escapeIdentifier);
  } else {
    yield fixer.replaceTextRange([startR, endR], `"${escapeIdentifier}"`);
  }

  const nodeText = ctx.ruleContext.getSourceCode().getText(unsafeNode);

  // No array and not in an object
  // Create a new array for placeholder values
  if (!placeholderValuesNode && !objNode) {
    yield fixer.insertTextAfter(queryNode, ", [" + nodeText + "]");
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
