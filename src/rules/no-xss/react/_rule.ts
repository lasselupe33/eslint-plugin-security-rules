import { TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";
import {
  RuleContext,
  RuleFixer,
} from "@typescript-eslint/utils/dist/ts-eslint";

import {
  isIdentifier,
  isJSXEmptyExpression,
  isJSXExpressionContainer,
  isJSXNamespacedName,
  isObjectExpression,
  isProperty,
} from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { traceVariable } from "../../../utils/tracing/_trace-variable";
import { withTrace } from "../../../utils/tracing/callbacks/with-trace";
import { isNodeTerminalNode } from "../../../utils/tracing/types/nodes";
import { getTypeProgram } from "../../../utils/types/get-type-program";
import { addSanitazionAtSink } from "../_utils/fixes/add-sanitation-sink";
import { NoXssOptions } from "../_utils/options";
import { getRelevantSinks } from "../_utils/sink/get-relevant-sinks";
import { isSourceSafe } from "../_utils/source/is-source-safe";

import { ASSIGNMENT_SINKS } from "./data";

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
 * Detects and reports if any expressions assign unsafe values to known react
 * reltaed XSS injection sinks.
 */
export const noReactXSSRule = createRule<NoXssOptions, MessageIds>({
  name: "no-xss/react",
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
        "This assignment may be vulnerable to XSS attacks due to external/unknown source",
      [MessageIds.ADD_SANITATION_FIX]:
        "Add sanitation before assigning unsafe value",
    },
    docs: {
      description: "Detects DOM-based XSS vulnerabilities introduced in JSX",
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
      JSXAttribute: (node) => {
        if (
          isJSXNamespacedName(node.name) ||
          !isJSXExpressionContainer(node.value)
        ) {
          return;
        }

        const expression = node.value.expression;

        if (isJSXEmptyExpression(expression)) {
          return;
        }

        const sink = getRelevantSinks(
          typeProgram,
          node.name,
          ASSIGNMENT_SINKS
        )[0];

        if (!sink) {
          return;
        }

        const value =
          "property" in sink
            ? getObjectProperty(context, expression, sink.property)
            : expression;

        if (!value) {
          return;
        }

        const isSafe = isSourceSafe(value, {
          context,
          options: sanitationOptions,
          sinkType: sink.type,
        });

        if (isSafe) {
          return;
        }

        context.report({
          node: node.value,
          messageId: MessageIds.VULNERABLE_SINK,
          data: {
            sinkType: sink.type,
          },
          suggest: [
            {
              fix: (fixer: RuleFixer) =>
                addSanitazionAtSink(context, sanitationOptions, fixer, value),
              messageId: MessageIds.ADD_SANITATION_FIX,
            },
          ],
        });
      },
    };
  },
});

function getObjectProperty(
  context: RuleContext<MessageIds, NoXssOptions>,
  maybeObj: TSESTree.Node,
  property: string
): TSESTree.Node | undefined {
  let obj: TSESTree.Node = maybeObj;

  traceVariable(
    {
      node: maybeObj,
      context,
    },
    withTrace({
      onTraceFinished: (trace) => {
        const terminal = trace[trace.length - 1];

        if (
          isNodeTerminalNode(terminal) &&
          isObjectExpression(terminal.astNode)
        ) {
          obj = terminal.astNode;

          // @TODO: Consider if we should check all traces to identify multiple
          // assignments to expressions.
          return { halt: true };
        }
      },
    })
  );

  if (!isObjectExpression(obj)) {
    return;
  }

  return obj.properties.find(
    (it): it is TSESTree.Property =>
      isProperty(it) && isIdentifier(it.key) && it.key.name === property
  )?.value;
}
