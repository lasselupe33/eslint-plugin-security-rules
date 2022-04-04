/**
 * Progress
 *  [x] Detection
 *  [x] Automatic fix / Suggestions
 *  [x] Reduction of false positives
 *  [/] Fulfilling unit testing
 *  [x] Extensive documentation
 *  [/] Fulfilling configuration options
 */

import { TSESLint } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { extractIdentifier } from "../../../utils/ast/extract-identifier";
import { isLiteral } from "../../../utils/ast/guards";
import { isPackageAndFunction } from "../../../utils/ast/is-package-and-function";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { isAlgorithmSafe } from "../_utils/is-algorithm-safe";

import { MessageIds, errorMessages } from "./utils/messages";

type Config = {
  alg: string | undefined;
};

export type HandlingContext = {
  ruleContext: Readonly<TSESLint.RuleContext<MessageIds, unknown[]>>;
};

const createRule = RuleCreator(resolveDocsRoute);

export const cipherNoInsecureCiphers = createRule<[Config], MessageIds>({
  name: "node/no-insecure-ciphers",
  defaultOptions: [
    {
      alg: undefined,
    },
  ],
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
    schema: [
      {
        type: "object",
        items: {
          alg: { type: "string", required: false },
        },
      },
    ],
  },
  create: (context, [config]) => {
    return {
      CallExpression: (node) => {
        const FUNCTION_NAME = "createCipheriv";
        const MODULE_NAME = "crypto";
        const identifiers = extractIdentifier(node);
        const idRight = identifiers[identifiers.length - 1];

        if (
          !idRight ||
          !isPackageAndFunction(context, MODULE_NAME, FUNCTION_NAME, node)
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
              messageId: MessageIds.SAFE_ALGORITHM_CONFIG_FIX,
              data: { alg: troubleNode.value, fix: config.alg },
              fix: (fixer: TSESLint.RuleFixer) => {
                if (config.alg) {
                  return fixer.replaceText(troubleNode, '"' + config.alg + '"');
                } else return null;
              },
            },
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
