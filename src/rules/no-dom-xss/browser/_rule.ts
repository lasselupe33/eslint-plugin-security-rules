import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { isNewExpression } from "../../../utils/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { getTypeProgram } from "../../../utils/types/get-type-program";

import {
  ASSIGNMENT_EXPRESSION_SINKS,
  CALL_EXPRESSION_SINKS,
  NEW_EXPRESSION_SINKS,
} from "./sink/data";
import { isCallRelevant } from "./sink/is-call-relevant";
import { isSink } from "./sink/is-sink";
import { isSourceSafe } from "./source/is-source-safe";

/**
 * Progress
 *  [X] Detection
 *  [ ] Automatic fix / Suggestions
 *  [X] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
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
        const sink = isSink(
          typeProgram,
          node.left,
          ASSIGNMENT_EXPRESSION_SINKS
        );

        if (!sink) {
          return;
        }

        const isSafe = isSourceSafe(node.right, { context });

        if (isSafe) {
          return;
        }

        context.report({
          node: node.right,
          messageId: MessageIds.TEST,
          data: {
            sinkType: sink.type,
          },
        });
      },
      ["CallExpression, NewExpression"]: (
        node: TSESTree.CallExpression | TSESTree.NewExpression
      ) => {
        const sinks = isNewExpression(node)
          ? NEW_EXPRESSION_SINKS
          : CALL_EXPRESSION_SINKS;

        const relevantSinks = isCallRelevant(node.arguments, sinks);
        const sink = isSink(typeProgram, node.callee, relevantSinks);

        if (!sink) {
          return;
        }

        const index =
          typeof sink.paramterIndex === "number"
            ? sink.paramterIndex
            : sink.paramterIndex === "last"
            ? node.arguments.length - 1
            : undefined;

        const nodesToCheck =
          typeof index !== "undefined"
            ? [node.arguments[index]]
            : node.arguments;

        const isSafe = nodesToCheck.every((variable) =>
          isSourceSafe(variable, { context })
        );

        if (isSafe) {
          return;
        }

        context.report({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node: index ? node.arguments[index]! : node,
          messageId: MessageIds.TEST,
          data: {
            sinkType: sink.type,
          },
        });
      },
    };
  },
};
