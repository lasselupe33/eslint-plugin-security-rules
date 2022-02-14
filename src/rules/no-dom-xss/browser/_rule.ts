import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { RuleFix, RuleFixer } from "@typescript-eslint/utils/dist/ts-eslint";

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
 *  [X] Automatic fix / Suggestions
 *  [X] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

enum MessageIds {
  TEST = "test",
  FIX = "fix",
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
      [MessageIds.FIX]: "lol",
    },
    docs: {
      description: "Relevant assertion methods must be used on fastify routes",
      recommended: "error",
      url: resolveDocsRoute(__dirname),
      suggestion: true,
    },
    hasSuggestions: true,
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
          suggest: [
            {
              fix: (fixer: RuleFixer) => addSanitazionAtSink(fixer, node.right),
              messageId: MessageIds.FIX,
            },
          ],
        });
      },
      ["CallExpression, NewExpression"]: (
        node: TSESTree.CallExpression | TSESTree.NewExpression
      ) => {
        const sinks = isNewExpression(node)
          ? NEW_EXPRESSION_SINKS
          : CALL_EXPRESSION_SINKS;

        const relevantSinks = isCallRelevant(context, node.arguments, sinks);
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

function* addSanitazionAtSink(
  fixer: RuleFixer,
  unsafeNode: TSESTree.Node
): Generator<RuleFix> {
  yield fixer.insertTextBefore(unsafeNode, "safe(");
  yield fixer.insertTextAfter(unsafeNode, ")");
}
