import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { SourceFile } from "typescript";

import {
  isCallExpression,
  isIdentifier,
  isObjectExpression,
  isProperty,
  isLiteral,
} from "../../../utils/guards";
import { getNodeType } from "../../../utils/types/get-node-type";
import { getTypeProgram } from "../../../utils/types/get-type-program";
import { isSafeValue } from "../utils/is-safe-value";

/**
 * Progress
 *  [-] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
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
          const { typeName, returnTypeNames, sourceFile } = getNodeType(
            typeProgram,
            rhs.callee
          );
          if (
            typeName == "createConnection" &&
            returnTypeNames[0] === "Connection" &&
            sourceFile?.fileName.endsWith("@types/mysql/index.d.ts")
          ) {
            const arg = rhs.arguments[0];
            if (isObjectExpression(arg)) {
              arg.properties.flatMap((property) => {
                if (
                  isProperty(property) &&
                  isIdentifier(property.key) &&
                  property.key.name.toLowerCase() === "password"
                ) {
                  if (
                    isLiteral(property.value) &&
                    !isSafeValue(property.value)
                  ) {
                    report(property.value);
                  }
                }
              });
            }
          }
        }
      },
    };
  },
};
