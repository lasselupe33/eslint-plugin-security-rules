import { TSESLint, TSESTree, AST_NODE_TYPES } from "@typescript-eslint/utils";

/**
 * Progress
 *  [x] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 */

/**
 * There exists a wide array of secrets. These can be defined into the
 * following:
 * - secret: A generic secret or trusted data
 * - id: a user name or other account information
 * - password: a password or authorization key
 * - certificate: a certificate
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
    console.log(context);
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
     * @param {string} testString The name to check
     * @returns {Boolean} Whether the name should be reported.
     */
    function isPassword(testString: string) {
      const reg = /^pass(wd|word|code|phrase)?/;
      return reg.test(testString);
    }
    return {
      VariableDeclarator: (node) => {
        if (
          !node.init ||
          node.id.type !== AST_NODE_TYPES.Identifier ||
          !node.id.name
        ) {
          return;
        }

        if (isPassword(node.id.name)) {
          //TODO: Reduce FP by removing common test PW
          report(node, node.id.name);
        }
      },
    };
  },
};
