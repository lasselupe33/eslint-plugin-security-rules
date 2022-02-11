import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
  isCallExpression,
  isIdentifier,
  isObjectExpression,
  isProperty,
} from "../../../utils/guards";
import { getTypeProgram } from "../../../utils/types/get-type-program";

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
    const typeProgram = getTypeProgram(context);

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
        const rhs = node.init;
        if (isIdentifier(rhs.callee)) {
          /* const { typeName, baseTypeNames, returnTypeNames } = getNodeType(
            typeProgram,
            rhs.callee
          ); */
          if (rhs.callee.name == "createConnection") {
            const arg = rhs.arguments[0];
            if (isObjectExpression(arg)) {
              arg.properties.flatMap((property) => {
                if (
                  isProperty(property) &&
                  isIdentifier(property.key) &&
                  property.key.name.toLowerCase() === "password"
                ) {
                  //No op
                }
              });
            }
          }
        }
      },
    };
  },
};
