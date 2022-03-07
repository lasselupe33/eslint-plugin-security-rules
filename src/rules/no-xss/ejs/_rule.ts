import { TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";
import {
  RuleContext,
  RuleFixer,
} from "@typescript-eslint/utils/dist/ts-eslint";

import { isObjectExpression, isProperty } from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { traceVariable } from "../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../utils/tracing/callbacks/with-current-trace";
import {
  isImportTerminalNode,
  isNodeTerminalNode,
} from "../../../utils/tracing/types/nodes";
import { addSanitazionAtSink } from "../_utils/fixes/add-sanitation-sink";
import { NoXssOptions } from "../_utils/options";
import { isSourceSafe } from "../_utils/source/is-source-safe";

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
  VULNERABLE_DATA = "vulnerable-data",
  ADD_SANITATION_FIX = "add-sanitation-fix",
}

const createRule = RuleCreator(resolveDocsRoute);

/**
 * Detects and reports if any expressions assign unsafe values to known react
 * reltaed XSS injection sinks.
 */
export const noEjsXSSRule = createRule<NoXssOptions, MessageIds>({
  name: "no-xss/ejs",
  defaultOptions: [
    {
      sanitation: {
        package: "isomorphic-dompurify",
        method: "sanitize",
        usage: "sanitize(<% html %>, { USE_PROFILES: { html: true } })",
      },
    },
  ],
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      [MessageIds.VULNERABLE_DATA]:
        "Inserting unsanitzed data into templates may result in XSS attacks.",
      [MessageIds.ADD_SANITATION_FIX]:
        "Add sanitation before assigning unsafe value",
    },
    docs: {
      description:
        "Detects Stored/Reflcted XSS vulnerabilities introduced by using EJS",
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
    return {
      CallExpression: (node) => {
        const secondArg = node.arguments[1];

        // Vulnerable data will always be inserted as the second argument in
        // EJS. In case there isn't at least two arguments whe can hence safely
        // assume that this is NOT an ejs call.
        if (!secondArg || !isEjsImport({ context, node: node.callee })) {
          return;
        }

        const dataObject = getObjectExpression(context, secondArg);

        for (const property of dataObject?.properties ?? []) {
          if (!isProperty(property)) {
            continue;
          }

          const isSafe = isSourceSafe(property, {
            context,
            options: sanitationOptions,
          });

          if (isSafe) {
            return;
          }
          context.report({
            node: secondArg,
            messageId: MessageIds.VULNERABLE_DATA,
            suggest: [
              {
                fix: (fixer: RuleFixer) =>
                  addSanitazionAtSink(
                    sanitationOptions,
                    fixer,
                    property.value,
                    context.getScope()
                  ),
                messageId: MessageIds.ADD_SANITATION_FIX,
              },
            ],
          });
        }
      },
    };
  },
});

function isEjsImport({
  context,
  node,
}: {
  context: RuleContext<MessageIds, NoXssOptions>;
  node: TSESTree.Node;
}): boolean {
  let isMatch = false;

  traceVariable(
    {
      node,
      context,
    },
    makeTraceCallbacksWithTrace({
      onTraceFinished: (trace) => {
        const finalNode = trace[trace.length - 1];

        if (
          isImportTerminalNode(finalNode) &&
          finalNode.source === "ejs" &&
          (finalNode.imported === "render" ||
            finalNode.imported === "renderFile")
        ) {
          isMatch = true;
        }
      },
    })
  );

  return isMatch;
}

function getObjectExpression(
  context: RuleContext<MessageIds, NoXssOptions>,
  maybeObj: TSESTree.Node
): TSESTree.ObjectExpression | undefined {
  if (isObjectExpression(maybeObj)) {
    return maybeObj;
  }

  let obj: TSESTree.ObjectExpression | undefined;

  traceVariable(
    {
      node: maybeObj,
      context,
    },
    makeTraceCallbacksWithTrace({
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

  return obj;
}
