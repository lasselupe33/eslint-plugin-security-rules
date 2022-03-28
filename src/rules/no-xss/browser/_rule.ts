import { TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";
import { RuleFixer } from "@typescript-eslint/utils/dist/ts-eslint";

import { isNewExpression } from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { getTypeProgram } from "../../../utils/types/get-type-program";
import { addSanitazionAtSink } from "../_utils/fixes/add-sanitation-sink";
import { NoXssOptions } from "../_utils/options";
import { getRelevantSinks } from "../_utils/sink/get-relevant-sinks";
import { isCallRelevant } from "../_utils/sink/is-call-relevant";
import { isSourceSafe } from "../_utils/source/is-source-safe";

import {
  ASSIGNMENT_EXPRESSION_SINKS,
  CALL_EXPRESSION_SINKS,
  NEW_EXPRESSION_SINKS,
} from "./data";

/**
 * Progress
 *  [X] Detection
 *  [X] Automatic fix / Suggestions
 *  [X] Reduction of false positives
 *  [-] Fulfilling unit testing
 *  [X] Extensive documentation
 *  [X] Fulfilling configuration options
 */

export enum MessageIds {
  VULNERABLE_SINK = "vulnerable-sink",
  ADD_SANITATION_FIX = "add-sanitation-fix",
}

const createRule = RuleCreator(resolveDocsRoute);

/**
 * Detects and reports if any expressions assign unsafe values to known vanilla
 * XSS injection sinks.
 */
export const noBrowserXSSRule = createRule<NoXssOptions, MessageIds>({
  name: "no-xss/browser",
  defaultOptions: [
    {
      sanitation: {
        package: "dompurify",
        method: "sanitize",
        usage: "sanitize(<% html %>, { USE_PROFILES: { html: true } })",
      },
    },
  ],
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      [MessageIds.VULNERABLE_SINK]:
        "This assignment may vulnerable to XSS attacks",
      [MessageIds.ADD_SANITATION_FIX]:
        "Add sanitation before assigning unsafe value",
    },
    docs: {
      description: "Detects DOM-based XSS vulnerabilities",
      recommended: "error",
      suggestion: true,
    },
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        items: {
          sanitation: {
            type: "object",
            required: false,
            properties: {
              package: { type: "string", required: true },
              method: { type: "string", required: true },
              usage: { type: "string", required: false },
            },
          },
        },
      },
    ],
  },
  create: (context, [sanitationOptions]) => {
    const typeProgram = getTypeProgram(context);

    return {
      AssignmentExpression: (node) => {
        const sink = getRelevantSinks(
          typeProgram,
          node.left,
          ASSIGNMENT_EXPRESSION_SINKS
        )[0];

        if (!sink) {
          return;
        }

        const isSafe = isSourceSafe(node.right, {
          context,
          options: sanitationOptions,
        });

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
              fix: (fixer: RuleFixer) =>
                addSanitazionAtSink(
                  context,
                  sanitationOptions,
                  fixer,
                  node.right
                ),
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

        const relevantSinks = getRelevantSinks(typeProgram, node.callee, sinks);
        const sink = isCallRelevant(context, node.arguments, relevantSinks)[0];

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
          (variable) =>
            !isSourceSafe(variable, { context, options: sanitationOptions })
        );

        if (vulnerableNodes.length === 0) {
          return;
        }

        context.report({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node: vulnerableNodes[0]!,
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

                  yield* addSanitazionAtSink(
                    context,
                    sanitationOptions,
                    fixer,
                    node
                  );
                }
              },
              messageId: MessageIds.ADD_SANITATION_FIX,
            },
          ],
        });
      },
    };
  },
});
