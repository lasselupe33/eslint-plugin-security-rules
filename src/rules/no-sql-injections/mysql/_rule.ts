import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { extractIdentifier } from "../../../utils/ast/extract-identifier";
import { isArrowFunctionExpression } from "../../../utils/ast/guards";
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
  name: "mysql/no-sql-injections",
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
          !query ||
          !isPackage(context, "mysql", node)
        ) {
          return;
        }

        const {
          isSafe: isCurrentQuerySafe,
          troubleNode: maybeNode,
          queryUpToNode: maybeQuery,
        } = isQuerySafe({ ruleContext: context }, query);

        if (isCurrentQuerySafe || !maybeNode) {
          return;
        }

        let valuesArray: TSESTree.ArrayExpression | undefined = undefined;

        const queryValues = node.arguments[1];

        if (!isArrowFunctionExpression(queryValues) && queryValues) {
          valuesArray = extractValuesArray(
            { ruleContext: context },
            queryValues
          );
        }

        // @TODO: Parameterization fix
        // const totalPlaceholders = countPlaceholders(maybeQuery);

        context.report({
          node: maybeNode,
          messageId: MessageIds.VULNERABLE_QUERY,
          data: { maybeNode },
          suggest: [
            {
              messageId: MessageIds.ESCAPE_FIX_VALUES,
              fix: (fixer: TSESLint.RuleFixer) =>
                escapeQueryValuesFix(fixer, maybeNode, escapeIdentifier),
            },
            {
              messageId: MessageIds.ESCAPE_FIX_IDENTIFIERS,
              fix: (fixer: TSESLint.RuleFixer) =>
                escapeQueryIdentifiersFix(fixer, maybeNode, escapeIdentifier),
            } /* 
            // @TODO: Count numbers of occourences of an identifier
            // in the query to place it correctly in the array.
            {
              messageId: MessageIds.PARAMTERIZED_FIX_VALUES,
              fix: (fixer: TSESLint.RuleFixer) =>
                paramterizeQueryFix(
                  { ruleContext: context },
                  fixer,
                  totalPlaceholders,
                  query,
                  false,
                  valuesArray,
                  maybeNode
                ),
            },
            {
              messageId: MessageIds.PARAMTERIZED_FIX_IDENTIFIERS,
              fix: (fixer: TSESLint.RuleFixer) =>
                paramterizeQueryFix(
                  { ruleContext: context },
                  fixer,
                  totalPlaceholders,
                  query,
                  true,
                  valuesArray,
                  maybeNode
                ),
            }, */,
          ],
        });
      },
    };
  },
});

function* escapeQueryValuesFix(
  fixer: TSESLint.RuleFixer,
  node: TSESTree.Node,
  escapeIdentifier: string
): Generator<TSESLint.RuleFix> {
  if (escapeIdentifier.length === 0) {
    return;
  }

  yield fixer.insertTextBefore(node, escapeIdentifier + ".escape(");
  yield fixer.insertTextAfter(node, ")");
}

function* escapeQueryIdentifiersFix(
  fixer: TSESLint.RuleFixer,
  node: TSESTree.Node,
  escapeIdentifier: string
): Generator<TSESLint.RuleFix> {
  if (escapeIdentifier.length === 0) {
    return;
  }

  yield fixer.insertTextBefore(node, escapeIdentifier + ".escapeId(");
  yield fixer.insertTextAfter(node, ")");
}

function* paramterizeQueryFix(
  ctx: HandlingContext,
  fixer: TSESLint.RuleFixer,
  totalPlaceholders: number,
  queryLocation: TSESTree.CallExpressionArgument,
  identifierFix: boolean,
  arrayNode?: TSESTree.ArrayExpression,
  replaceNode?: TSESTree.Node
): Generator<TSESLint.RuleFix> {
  if (!replaceNode || !queryLocation) {
    return;
  }

  if (totalPlaceholders > 0 && !arrayNode) {
    return;
  }

  // Since index starts counting from 0 and not 1, we can just set it to
  // placeholders.
  const index = totalPlaceholders;

  const nodeText = ctx.ruleContext.getSourceCode().getText(replaceNode);

  // Parameterization
  if (identifierFix) {
    yield fixer.replaceText(replaceNode, '"??"');
  } else {
    yield fixer.replaceText(replaceNode, '"?"');
  }

  // No array
  if (!arrayNode) {
    yield fixer.insertTextAfter(queryLocation, ", [" + nodeText + "]");
  }
  // If we need to replace an array element
  else if (arrayNode.elements.length >= index) {
    const elm = arrayNode.elements[index];
    if (!elm) {
      return;
    }
    yield fixer.insertTextBefore(elm, nodeText + ", ");
  }
  // Existing placeholder array
  else if (arrayNode) {
    const rangeEnd = arrayNode.range[1] - 1;
    yield fixer.insertTextAfterRange([0, rangeEnd], ", " + nodeText);
  }
}
