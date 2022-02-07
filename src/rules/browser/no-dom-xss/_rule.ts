import { TSESLint } from "@typescript-eslint/utils";

import { resolveDocsRoute } from "../../../utils/resolveDocsRoute";
import { getTypeProgram } from "../../../utils/types/getTypeProgram";

import {
  ASSIGNMENT_EXPRESSION_SINKS,
  CALL_EXPRESSION_SINKS,
  NEW_EXPRESSION_SINKS,
} from "./sinks";
import { isCallRelevant } from "./utils/is-call-relevant";
import { isSink } from "./utils/is-sink";

/**
 * Progress
 *  [-] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 */

enum MessageIds {
  TEST = "test",
}

/**
 * Detects and reports if any expressions assign unsafe values to known vanilla
 * XSS injection sinks.
 */
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
      CallExpression: (node) => {
        const relevantSinks = isCallRelevant(
          node.arguments,
          CALL_EXPRESSION_SINKS
        );

        const sinkType = isSink(typeProgram, node.callee, relevantSinks);

        if (sinkType) {
          context.report({
            node: node,
            messageId: MessageIds.TEST,
            data: {
              sinkType,
            },
          });
        }
      },
      NewExpression: (node) => {
        const relevantSinks = isCallRelevant(
          node.arguments,
          NEW_EXPRESSION_SINKS
        );

        const sinkType = isSink(typeProgram, node.callee, relevantSinks);

        if (sinkType) {
          context.report({
            node: node,
            messageId: MessageIds.TEST,
            data: {
              sinkType,
            },
          });
        }
      },
    };
  },
};
