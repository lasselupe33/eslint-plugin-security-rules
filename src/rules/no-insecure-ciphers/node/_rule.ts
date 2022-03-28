/**
 * Progress
 *  [x] Detection
 *  [x] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

import { TSESLint } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { extractIdentifier } from "../../../utils/ast/extract-identifier";
import { isLiteral } from "../../../utils/ast/guards";
import { isPackage } from "../../../utils/ast/is-package";
import { isPackageAndFunction } from "../../../utils/ast/is-package-and-function";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { isAlgorithmSafe } from "../utils/is-algorithm-safe";

import { MessageIds, errorMessages } from "./utils/messages";

export type HandlingContext = {
  ruleContext: Readonly<TSESLint.RuleContext<MessageIds, unknown[]>>;
};

const createRule = RuleCreator(resolveDocsRoute);

export const cipherNoInsecureCiphers = createRule<never[], MessageIds>({
  name: "node/no-insecure-ciphers",
  defaultOptions: [],
  meta: {
    type: "problem",
    fixable: "code",
    messages: errorMessages,
    docs: {
      recommended: "error",
      description: "Description",
      suggestion: true,
    },
    hasSuggestions: true,
    schema: {},
  },
  create: (context) => {
    return {
      CallExpression: (node) => {
        const [idLeft, idRight] = extractIdentifier(node);

        const functionName = "createCipheriv";
        const moduleName = "crypto";

        const didMatchIdentifierName = idRight?.name === functionName;

        if (!idRight) {
          if (
            !idLeft ||
            !isPackageAndFunction(context, moduleName, functionName, idLeft)
          ) {
            return;
          }
        } else if (
          !didMatchIdentifierName ||
          !isPackage(context, moduleName, idLeft)
        ) {
          return;
        }

        // Assuming algorithm is always located in the first arg
        const alg = node.arguments[0];

        if (!alg) {
          return;
        }

        const [isAlgSafe, troubleNode] = isAlgorithmSafe(context, alg);

        if (isAlgSafe || !troubleNode || !isLiteral(troubleNode)) {
          return;
        }

        context.report({
          node: troubleNode,
          messageId: MessageIds.INSECURE_CIPHER,
          suggest: [
            {
              messageId: MessageIds.SAFE_ALGORITHM_FIX_128,
              data: { alg: troubleNode.value },
              fix: (fixer: TSESLint.RuleFixer) => {
                return fixer.replaceText(troubleNode, '"AES-128-GCM"');
              },
            },
            {
              messageId: MessageIds.SAFE_ALGORITHM_FIX_192,
              data: { alg: troubleNode.value },
              fix: (fixer: TSESLint.RuleFixer) => {
                return fixer.replaceText(troubleNode, '"AES-192-GCM"');
              },
            },
            {
              messageId: MessageIds.SAFE_ALGORITHM_FIX_256,
              data: { alg: troubleNode.value },
              fix: (fixer: TSESLint.RuleFixer) => {
                return fixer.replaceText(troubleNode, '"AES-256-GCM"');
              },
            },
          ],
        });
      },
    };
  },
});
