import { TSESLint, TSESTree } from "@typescript-eslint/utils";

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
    const test = context;
    const typeProgram = getTypeProgram(context);

    return {
      VariableDeclarator: (node) => {
        if (
          !node.init ||
          !isCallExpression(node.init) ||
          !isIdentifier(node.init.callee)
        ) {
          return;
        }
        // rhs = createConnection({..})
        const rhs = node.init;
        const { typeName, returnTypeNames, sourceFile } = getNodeType(
          typeProgram,
          rhs.callee // createConnection
        );

        // We want to check that we are using the mysql package.
        if (!sourceFile?.fileName.endsWith("@types/mysql/index.d.ts")) {
          return;
        }

        if (
          typeName === "createConnection" &&
          returnTypeNames[0] === "Connection"
        ) {
          // Assuming that createConnection only contains one arg based on it's
          // definition.
          const arg = rhs.arguments[0];

          // If we're using ConnectionConfig
          if (isObjectExpression(arg)) {
            checkArgumentsForPassword(arg.properties, context);
          }
          // TODO: Unhandled connectionURI
        } else if (typeName === "createPool" && returnTypeNames[0] === "Pool") {
          // Assuming that createPool only contains one arg
          // based on it's definition.
          const arg = rhs.arguments[0];

          // If we're using PoolConfig
          if (isObjectExpression(arg)) {
            checkArgumentsForPassword(arg.properties, context);
          }

          // TODO: Unhandled connectionURI
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
