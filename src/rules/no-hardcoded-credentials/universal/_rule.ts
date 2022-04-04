import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
  isArrayExpression,
  isArrayPattern,
  isIdentifier,
  isLiteral,
} from "../../../utils/ast/guards";
import { isSafeValue } from "../_utils/is-safe-value";

import { errorMessages, MessageIds } from "./utils/messages";

/**
 * Progress
 *  [-] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [-] Fulfilling unit testing
 *  [x] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

/**
 * There exists a wide array of secrets. These can be defined into the
 * following:
 * - secret: A generic secret or trusted data
 * - id: a user name or other account information
 * - password: a password or authorization key
 * - certificate: a certificate
 */

export const uniNoHardcodedCredentials: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "problem",
    messages: errorMessages,
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
        messageId: MessageIds.HARDCODED_CREDENTIAL,
        data: { node },
      });
    }

    return {
      Property: (property) => {
        if (
          !isIdentifier(property.key) ||
          !isPasswordName(property.key.name) ||
          isSafeValue(context, property.value)
        ) {
          return;
        }

        report(property.value);
      },

      VariableDeclarator: (node) => {
        if (!node.init) {
          return;
        }

        if (isArrayPattern(node.id) && isArrayExpression(node.init)) {
          const table = retrieveNameAndValues(node.id, node.init);
          for (const pair of table) {
            if (
              isPasswordName(pair.id.name) &&
              !isSafeValue(context, pair.val)
            ) {
              report(pair.val);
            }
          }
        } else if (isIdentifier(node.id)) {
          if (
            isPasswordName(node.id.name) &&
            isLiteral(node.init) &&
            !isSafeValue(context, node.init)
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
  // i: ignoreCase
  // (?<!^) - negative lookbehind -it matches if the string does not match
  // (?!) is a negative lookahead
  const reg = new RegExp(
    /^(?<!.*(length|len|limit|lim))pass(wd|word|code|phrase)?(?!.*(length|len|limit|lim))/,
    "i"
  );
  return reg.test(testString);
}
