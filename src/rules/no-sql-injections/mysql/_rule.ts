import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { isTemplateLiteral } from "../../../utils/guards";

import { handleIdentifier } from "./handlers/handle-identifier";
import { handleTemplateLiteral } from "./handlers/handle-template-literal";
import { extractIdentifier } from "./utils/extract-identifier";
import { extractQuery } from "./utils/extract-query";

/**
 * Progress
 *  [ ] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

export type HandlingContext = {
  ruleContext: Readonly<TSESLint.RuleContext<MessageIds, []>>;
};

enum MessageIds {
  VULNERABLE_QUERY = "vulnerable-query",
  PARAMTERIZED_FIX = "parameterized-fix",
}

export const mysqlNoSQLInjections: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "problem",
    messages: {
      [MessageIds.VULNERABLE_QUERY]:
        "The query is vulnerable to SQL injections",
      [MessageIds.PARAMTERIZED_FIX]: "",
    },
    docs: {
      recommended: "error",
      description: "Description",
    },
    schema: {},
  },

  create: (context) => {
    return {
      CallExpression: (node) => {
        const id = extractIdentifier(node);

        const didMatchIdentifierName = handleIdentifier(
          { ruleContext: context },
          id
        );

        if (!didMatchIdentifierName) {
          return;
        }

        const queryParam = node.arguments[0];
        const queryLiteral = extractQuery(queryParam);

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
        if (templateLiteralArray.length > 1) {
          context.report({
            node: queryLiteral,
            messageId: MessageIds.VULNERABLE_QUERY,
            data: { queryLiteral },
          });
        }
      },
    };
  },
};

export function report(node: TSESTree.Node, ctx: HandlingContext) {
  ctx.ruleContext.report({
    node,
    messageId: MessageIds.VULNERABLE_QUERY,
    data: { node },
  });
}
