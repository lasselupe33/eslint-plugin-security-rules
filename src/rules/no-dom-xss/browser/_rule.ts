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
  VULNERABLE_SINK = "vulnerable-sink",
  ADD_SANITATION_FIX = "add-sanitation-fix",
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
      [MessageIds.VULNERABLE_SINK]:
        "This assignment is vulnerable to XSS attacks, it acts as a {{ sinkType }} sink",
      [MessageIds.ADD_SANITATION_FIX]:
        "Add sanitation before assigning vulnerable value",
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
          messageId: MessageIds.VULNERABLE_SINK,
          data: {
            sinkType: sink.type,
          },
          suggest: [
            {
              fix: (fixer: RuleFixer) => addSanitazionAtSink(fixer, node.right),
              messageId: MessageIds.ADD_SANITATION_FIX,
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

        const vulnerableNodes = nodesToCheck.filter(
          (variable) => !isSourceSafe(variable, { context })
        );

        if (vulnerableNodes.length === 0) {
          return;
        }

        context.report({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node: index ? node.arguments[index]! : node,
          messageId: MessageIds.VULNERABLE_SINK,
          data: {
            sinkType: sink.type,
          },
          suggest: [
            {
              fix: function* fixer(fixer: RuleFixer) {
                for (const node of vulnerableNodes) {
                  if (!node) {
                    return;
                  }

                  for (const fix of addSanitazionAtSink(fixer, node)) {
                    yield fix;
                  }
                }
              },
              messageId: MessageIds.ADD_SANITATION_FIX,
            },
          ],
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
