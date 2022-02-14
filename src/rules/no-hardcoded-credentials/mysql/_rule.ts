import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { isIdentifier, isProperty, isLiteral } from "../../../utils/guards";
import { isSafeValue } from "../utils/is-safe-value";

import { handleIdentifier } from "./handlers/handle-identifier";
import { extractIdentifier } from "./utils/extract-identifier";
import { extractObjectProperties } from "./utils/extract-object-properties";

// TODO : Check on AST properties instead of only type properties

/**
 * Progress
 *  [-] Detection
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
  ERRROR1 = "string",
}

export const noHardcodedCredentials: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "problem",
    messages: {
      [MessageIds.ERRROR1]: "Including passwords is bad",
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

        const handled = handleIdentifier({ ruleContext: context }, id);

        if (handled) {
          const properties = extractObjectProperties(node);
          checkArgumentsForPassword({ ruleContext: context }, properties);
          // TODO: Unhandled connectionURI
        }
      },
    };
  },
};

function checkArgumentsForPassword(
  ctx: HandlingContext,
  properties: TSESTree.ObjectLiteralElement[] | undefined
) {
  if (!properties) {
    return;
  }
  for (const property of properties) {
    if (
      isProperty(property) &&
      isIdentifier(property.key) &&
      property.key.name.toLowerCase() === "password"
    ) {
      if (isLiteral(property.value) && !isSafeValue(property.value)) {
        report(property.value, ctx);
      }
    }
  }
}

function report(node: TSESTree.Node, ctx: HandlingContext) {
  ctx.ruleContext.report({
    node,
    messageId: MessageIds.ERRROR1,
    data: { node },
  });
}
