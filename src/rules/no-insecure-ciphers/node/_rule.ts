/**
 * Progress
 *  [ ] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

import { TSESLint } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { extractIdentifier } from "../../../utils/extract-identifier";
import { isPackage } from "../../../utils/is-package";
import { isPackageAndFunction } from "../../../utils/is-package-and-function";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";

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
        let functionId = idRight;

        // console.log(idLeft?.name, idRight?.name);

        const didMatchIdentifierName = idRight?.name === functionName;

        if (!idRight) {
          if (
            !idLeft ||
            !isPackageAndFunction(context, moduleName, functionName, idLeft)
          ) {
            return;
          }
          functionId = idLeft;
        } else if (
          !didMatchIdentifierName ||
          !isPackage(context, moduleName, idLeft)
        ) {
          return;
        }

        // console.log("Got a valid function called: ", functionId?.name);
      },
    };
  },
});
