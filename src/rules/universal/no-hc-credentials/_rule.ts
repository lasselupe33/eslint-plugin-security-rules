import { report } from "process";

import { TSESLint, TSESTree, AST_NODE_TYPES } from "@typescript-eslint/utils";

/**
 * Progress
 *  [x] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 */

enum MessageIds {
  ERRROR1 = "string",
}

export const noHcCredentials: TSESLint.RuleModule<MessageIds> = {
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
    /**
     * Reports to ESLint
     * @param {TSESTree.Node} node The node to report
     * @param {string} name The name of the variable
     */
    function report(node: TSESTree.Node, name: string) {
      context.report({
        node: node,
        messageId: MessageIds.ERRROR1,
        data: { node },
      });
    }
    /**
     * Checks whether a variable name is bad
     * @param {string} name The name to check
     * @returns {Boolean} Whether the name should be reported.
     */
    function isBadName(name: string) {
      return /^(pass(word)?)/.test(name);
    }

    return {
      VariableDeclarator: (node) => {
        if (!node.init || node.id.type !== "Identifier" || !node.id.name) {
          return;
        }

        if (isBadName(node.id.name)) {
          report(node, node.id.name);
        }
      },
    };
  },
};
