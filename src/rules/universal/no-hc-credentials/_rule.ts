import { TSESLint, TSESTree } from "@typescript-eslint/utils";

/**
 * Progress
 *  [ ] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 */

enum MessageIds {
  ERRROR1 = "string",
}

export const noHcCredentials: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "problem",
    docs: {
      recommended: "error",
      description: "Description",
    },
    messages: {
      [MessageIds.ERRROR1]: "Error message",
    },
    schema: {},
  },

  create: (context) => {
    console.log(context);
    return {
      VariableDeclaration: (node) => {
        console.log(node);
        // Print node til konsol, og check AST
      },
    };
  },
};
