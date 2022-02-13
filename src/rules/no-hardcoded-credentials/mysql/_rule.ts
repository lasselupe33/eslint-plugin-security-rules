import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
  isCallExpression,
  isIdentifier,
  isObjectExpression,
  isProperty,
  isLiteral,
  isMemberExpression,
} from "../../../utils/guards";
import { getNodeType } from "../../../utils/types/get-node-type";
import { getTypeProgram } from "../../../utils/types/get-type-program";
import { isSafeValue } from "../utils/is-safe-value";

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

    function handle(
      skipTypescript: boolean,
      node: TSESTree.CallExpression
    ): void {
      // Assuming that createConnection only contains one arg based on
      // it's definition.
      const arg = node.arguments[0];

      // If we're using ConnectionConfig
      if (isObjectExpression(arg)) {
        checkArgumentsForPassword(arg.properties, context);
      }
      // TODO: Unhandled connectionURI
    }

    return {
      VariableDeclarator: (node) => {
        let skipTypescript = true;
        if (typeProgram) {
          skipTypescript = false;
        }

        if (!node.init) {
          return;
        }
        const { typeName, fullyQualifiedName } = getNodeType(
          typeProgram,
          node.init
        );

        if (!skipTypescript) {
          if (!fullyQualifiedName?.includes("@types/mysql/index")) {
            return;
          }
        }

        // mysql.createConnection or mysql.createPool
        if (
          isCallExpression(node.init) &&
          isMemberExpression(node.init.callee) &&
          isIdentifier(node.init.callee.property)
        ) {
          if (node.init.callee.property.name === "createConnection") {
            if (!skipTypescript) {
              if (!(typeName === "Connection")) {
                return;
              }
            }
            // handle createConnection;
            handle(skipTypescript, node.init);
          } else if (node.init.callee.property.name === "createPool") {
            if (!skipTypescript) {
              if (!(typeName === "Pool")) {
                return;
              }
            }
            // handle createPool
            handle(skipTypescript, node.init);
          }
        }
        // createConnection or createPool
        else if (
          isCallExpression(node.init) &&
          isIdentifier(node.init.callee)
        ) {
          if (node.init.callee.name === "createConnection") {
            if (!skipTypescript) {
              if (!(typeName === "Connection")) {
                return;
              }
            }
            // handle createConnection;
            handle(skipTypescript, node.init);
          } else if (node.init.callee.name === "createPool") {
            // handle createPool
            if (!skipTypescript) {
              if (!(typeName === "Pool")) {
                return;
              }
            }
            // handle createPool
            handle(skipTypescript, node.init);
          }
        }
      },
    };
  },
};

function checkArgumentsForPassword(
  properties: TSESTree.ObjectLiteralElement[],
  context: Readonly<TSESLint.RuleContext<MessageIds, []>>
) {
  for (const property of properties) {
    if (
      isProperty(property) &&
      isIdentifier(property.key) &&
      property.key.name.toLowerCase() === "password"
    ) {
      if (isLiteral(property.value) && !isSafeValue(property.value)) {
        report(property.value, context);
      }
    }
  }
}

function report(
  node: TSESTree.Node,
  context: Readonly<TSESLint.RuleContext<MessageIds, []>>
) {
  context.report({
    node,
    messageId: MessageIds.ERRROR1,
    data: { node },
  });
}
