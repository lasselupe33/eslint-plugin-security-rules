import { TSESLint, TSESTree, AST_NODE_TYPES } from "@typescript-eslint/utils";

import {
  isArrayExpression,
  isArrayPattern,
  isIdentifier,
  isLiteral,
  isObjectExpression,
  isObjectPattern,
  isProperty,
  isStringLiteral,
} from "../../../utils/guards";

/**
 * Progress
 *  [-] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
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
    function report(node: TSESTree.Node) {
      context.report({
        node,
        messageId: MessageIds.ERRROR1,
        data: { node },
      });
    }

    return {
      VariableDeclarator: (node) => {
        if (!node.init) {
          return;
        }

        if (isObjectExpression(node.init)) {
          for (const property of node.init.properties) {
            console.log(property);
            if (
              isProperty(property) &&
              isIdentifier(property.key) &&
              isPasswordName(property.key.name) &&
              isLiteral(property.value) &&
              !isSafeValue(property.value)
            ) {
              report(property.value);
            }
          }
        } else if (isArrayPattern(node.id) && isArrayExpression(node.init)) {
          const table = retrieveNameAndValues(node.id, node.init);
          for (const pair of table) {
            console.log(pair);
          }
          table.forEach((pair) => {
            if (isPasswordName(pair.id?.name) && !isSafeValue(pair.val)) {
              report(pair.val);
            }
          });
        } else if (isIdentifier(node.id)) {
          if (
            isPasswordName(node.id.name) &&
            isLiteral(node.init) &&
            !isSafeValue(node.init)
          ) {
            report(node.init);
          }
        }
      },
    };
  },
};

function retrieveNameAndValues(
  nodeId: TSESTree.ArrayPattern,
  nodeInit: TSESTree.ArrayExpression
) {
  const match: {
    id: TSESTree.Identifier | null;
    val: TSESTree.Literal | null;
  }[] = [];

  for (const element of nodeId.elements) {
    if (isIdentifier(element)) {
      match.push({ id: element, val: null });
    } else {
      match.push({ id: null, val: null });
    }
  }

  for (let i = 0; i < match.length; i++) {
    const element = nodeInit.elements[i];
    if (isLiteral(element)) {
      const innerArray = match[i];
      if (innerArray != null) {
        innerArray.val = element;
      } // No else - val is already null
    }
  }

  const res = match.filter(
    (pair): pair is { id: TSESTree.Identifier; val: TSESTree.Literal } =>
      pair.id !== null || pair.val !== null
  );

  return res;
}

function isPasswordName(testString: string): boolean {
  const reg = /^pass(wd|word|code|phrase)?/;
  return reg.test(testString);
}

function isSafeValue(testCase: TSESTree.Literal): boolean {
  if (isStringLiteral(testCase)) {
    if (testCase.value === "") {
      return true;
    }

    const reg = /^test/;
    return reg.test(testCase.value);
  }
  return false;
}
