import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { isIdentifier } from "typescript";

import { isCallExpression, isMemberExpression } from "../../../utils/guards";

/**
 * Progress
 *  [-] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 */

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
    function report(node: TSESTree.Node) {
      context.report({
        node,
        messageId: MessageIds.ERRROR1,
        data: { node },
      });
    }

    return {
      VariableDeclarator: (node) => {
        if (!node.init || !isCallExpression(node.init)) {
          return;
        }

        console.log(node.init);
      },
    };
  },
};

function getCallExpressionIdentifier(node: TSESTree.CallExpression) {
  const res = null;
  //if (!isMemberExpression(node.callee) || !isIdentifier(node.callee.property))
}
