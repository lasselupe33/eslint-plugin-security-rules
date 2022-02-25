import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import {
  isTemplateElement,
  isTemplateLiteral,
} from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";

import { handleIdentifier } from "./handlers/handle-identifier";
import { handleTemplateLiteral } from "./handlers/handle-template-literal";
import { extractIdentifier } from "./utils/extract-identifier";
import { extractQuery } from "./utils/extract-query";

/**
 * Progress
 *  [-] Detection
 *  [-] Automatic fix / Suggestions
 *  [-] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

export type HandlingContext = {
  ruleContext: Readonly<TSESLint.RuleContext<MessageIds, unknown[]>>;
};

const createRule = RuleCreator(resolveDocsRoute);

enum MessageIds {
  VULNERABLE_QUERY = "vulnerable-query",
  PARAMTERIZED_FIX = "parameterized-fix",
  ESCAPE_FIX_VALUES = "escape-fix-values",
  ESCAPE_FIX_IDENTIFIERS = "escape-fix-identifiers",
}

export const mysqlNoSQLInjections = createRule<never[], MessageIds>({
  name: "mysql/no-sql-injections",
  defaultOptions: [],
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      [MessageIds.VULNERABLE_QUERY]:
        "The query is vulnerable to SQL injections",
      [MessageIds.PARAMTERIZED_FIX]:
        "(Recommended) Replace arguments with placeholders",
      [MessageIds.ESCAPE_FIX_VALUES]: "Escape as query values",
      [MessageIds.ESCAPE_FIX_IDENTIFIERS]: "Escape as query identifiers",
    },
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

        const didMatchIdentifierName = handleIdentifier(
          { ruleContext: context },
          idRight
        );

        if (!didMatchIdentifierName) {
          return;
        }

        // Assuming that query is always the first argument
        const queryParam = node.arguments[0];
        if (!queryParam) {
          return;
        }

        const queryLiteral = extractQuery({ ruleContext: context }, queryParam);

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

        for (const [node, isEscaped] of templateLiteralArray) {
          if (
            isEscaped !== undefined &&
            !isTemplateElement(node) &&
            !isEscaped
          ) {
            context.report({
              node: node,
              messageId: MessageIds.VULNERABLE_QUERY,
              data: { node },
              suggest: [
                {
                  messageId: MessageIds.ESCAPE_FIX_VALUES,
                  fix: (fixer: TSESLint.RuleFixer) =>
                    escapeQueryValuesFix(fixer, node, idLeft),
                },
                {
                  messageId: MessageIds.ESCAPE_FIX_IDENTIFIERS,
                  fix: (fixer: TSESLint.RuleFixer) =>
                    escapeQueryIdentifiersFix(fixer, node, idLeft),
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
