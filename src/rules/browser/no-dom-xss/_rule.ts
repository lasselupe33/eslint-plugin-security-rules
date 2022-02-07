import { TSESLint } from "@typescript-eslint/utils";

import { resolveDocsRoute } from "../../../utils/resolveDocsRoute";
import { getTypeProgram } from "../../../utils/types/getTypeProgram";

import { ASSIGNMENT_EXPRESSION_SINKS } from "./sinks";
import { isSink } from "./utils/is-sink";

/**
 * Progress
 *  [-] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Extensive documentation
 */

enum MessageIds {
  TEST = "test",
}

export const noDomXSSRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      [MessageIds.TEST]: "{{ sinkType }} sink",
    },
    docs: {
      description: "Relevant assertion methods must be used on fastify routes",
      recommended: "error",
      url: resolveDocsRoute(__dirname),
    },
    schema: {},
  },
  create: (context) => {
    const typeProgram = getTypeProgram(context);

    return {
      AssignmentExpression: (node) => {
        const sinkType = isSink(
          typeProgram,
          node.left,
          ASSIGNMENT_EXPRESSION_SINKS
        );

        if (sinkType) {
          context.report({
            node: node.right,
            messageId: MessageIds.TEST,
            data: {
              sinkType,
            },
          });
        }
      },
      // CallExpression: (node) => {},
      // NewExpression: (node) => {},
    };
  },
};
