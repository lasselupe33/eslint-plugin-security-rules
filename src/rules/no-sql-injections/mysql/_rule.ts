import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import {
  isArrayExpression,
  isLiteral,
  isTemplateElement,
  isTemplateLiteral,
} from "../../../utils/ast/guards";
import { isPackage } from "../../../utils/is-package";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { extractIdentifier } from "../utils/extract-identifier";
import { extractQuery } from "../utils/extract-query";
import { MessageIds, errorMessages } from "../utils/messages";

import { handleTemplateLiteral } from "./handlers/handle-template-literal";
import { countPlaceholders } from "./utils/count-placeholders";

/**
 * Progress
 *  [x] Detection
 *  [x] Automatic fix / Suggestions
 *  [-] Reduction of false positives
 *  [-] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
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
      description: "Description",
      suggestion: true,
    },
    hasSuggestions: true,
    schema: {},
  },
  create: (context) => {
    return {
      CallExpression: (node) => {
        // We need to extract connection as well, as users may
        // have defined some other name for it.
        // connection.query
        const [idLeft, idRight] = extractIdentifier(node);

        const didMatchIdentifierName = idRight?.name === "query";
        // Assuming that query is always the first argument
        const query = node.arguments[0];

        if (
          !didMatchIdentifierName ||
          !query ||
          !isPackage(context, "mysql", idLeft)
        ) {
          return;
        }

        const queryLiteral = extractQuery(context, query, "sql");

        if (!isTemplateLiteral(queryLiteral)) {
          return;
        }

        const templateLiteralArray = handleTemplateLiteral(
          { ruleContext: context },
          queryLiteral
        );

        // If it's a template literal, we want to check that it actually
        // uses template expressions. If it's just a string, it has the length
        // one, even though it spans multiple lines.
        if (templateLiteralArray.length <= 1) {
          return;
        }
        let indexCount = 0;
        for (const [arrayNode, isEscaped] of templateLiteralArray) {
          if (
            arrayNode &&
            isEscaped !== undefined &&
            !isTemplateElement(arrayNode) &&
            !isEscaped
          ) {
            indexCount++;
            context.report({
              node: arrayNode,
              messageId: MessageIds.VULNERABLE_QUERY,
              data: { arrayNode },
              suggest: [
                {
                  messageId: MessageIds.PARAMTERIZED_FIX_VALUES,
                  fix: (fixer: TSESLint.RuleFixer) =>
                    paramterizeQueryFix(
                      { ruleContext: context },
                      fixer,
                      arrayNode,
                      node,
                      countPlaceholders(templateLiteralArray, indexCount),
                      false
                    ),
                },
                {
                  messageId: MessageIds.PARAMTERIZED_FIX_IDENTIFIERS,
                  fix: (fixer: TSESLint.RuleFixer) =>
                    paramterizeQueryFix(
                      { ruleContext: context },
                      fixer,
                      arrayNode,
                      node,
                      countPlaceholders(templateLiteralArray, indexCount),
                      true
                    ),
                },
                {
                  messageId: MessageIds.ESCAPE_FIX_VALUES,
                  fix: (fixer: TSESLint.RuleFixer) =>
                    escapeQueryValuesFix(fixer, arrayNode, idLeft),
                },
                {
                  messageId: MessageIds.ESCAPE_FIX_IDENTIFIERS,
                  fix: (fixer: TSESLint.RuleFixer) =>
                    escapeQueryIdentifiersFix(fixer, arrayNode, idLeft),
                },
              ],
            });
          }
        }
      },
    };
  },
});

export function report(node: TSESTree.Node, ctx: HandlingContext) {
  ctx.ruleContext.report({
    node,
    messageId: MessageIds.VULNERABLE_QUERY,
    data: { node },
  });
}

function* escapeQueryValuesFix(
  fixer: TSESLint.RuleFixer,
  node: TSESTree.Expression,
  escapeIdentifier: TSESTree.Identifier | undefined
): Generator<TSESLint.RuleFix> {
  if (!escapeIdentifier) {
    return;
  }
  const leftString = escapeIdentifier.name + ".escape(";
  yield fixer.insertTextBefore(node, leftString);
  yield fixer.insertTextAfter(node, ")");
}

function* escapeQueryIdentifiersFix(
  fixer: TSESLint.RuleFixer,
  node: TSESTree.Expression,
  escapeIdentifier: TSESTree.Identifier | undefined
): Generator<TSESLint.RuleFix> {
  if (!escapeIdentifier) {
    return;
  }
  const leftString = escapeIdentifier.name + ".escapeId(";
  yield fixer.insertTextBefore(node, leftString);
  yield fixer.insertTextAfter(node, ")");
}

function* paramterizeQueryFix(
  ctx: HandlingContext,
  fixer: TSESLint.RuleFixer,
  arrayNode: TSESTree.Node,
  node: TSESTree.CallExpression,
  // index: number,
  totalPlaceholders: number,
  replaceWithIdentifier: boolean
): Generator<TSESLint.RuleFix> {
  const query = node.arguments[0];
  const paramsArray = node.arguments[1];

  if (!query) {
    return;
  }
  const nodeText = ctx.ruleContext.getSourceCode().getText(arrayNode);
  // Include the "${" characters
  const startR = arrayNode.range[0] - 2;
  // Include the "}" character
  const endR = arrayNode.range[1] + 1;

  if (replaceWithIdentifier) {
    yield fixer.replaceTextRange([startR, endR], "??");
  } else {
    yield fixer.replaceTextRange([startR, endR], "?");
  }

  if (!isArrayExpression(paramsArray) && !isLiteral(paramsArray)) {
    yield fixer.insertTextAfter(query, ", [" + nodeText + "]");
    return;
  } else if (isLiteral(paramsArray)) {
    yield fixer.replaceText(paramsArray, "[" + nodeText + "]");
    return;
  }

  const paramsLength = paramsArray.elements.length;

  if (paramsLength === 0) {
    yield fixer.insertTextAfterRange([0, paramsArray.range[0] + 1], nodeText);
  } else if (paramsLength > totalPlaceholders) {
    const replacableNode = paramsArray.elements[totalPlaceholders];
    if (!replacableNode) {
      return;
    }
    yield fixer.replaceText(replacableNode, nodeText);
  } else if (paramsLength === totalPlaceholders) {
    const prevNode = paramsArray.elements[totalPlaceholders - 1];
    if (!prevNode) {
      return;
    }
    yield fixer.insertTextAfter(prevNode, ", " + nodeText);
  } else {
    let insertText = "";
    const prevNode = paramsArray.elements[paramsLength - 1];
    if (!prevNode) {
      return;
    }
    for (let i = paramsLength; i < totalPlaceholders; i++) {
      insertText += ", undefined";
    }
    yield fixer.insertTextAfter(prevNode, insertText + ", " + nodeText);
  }
}
