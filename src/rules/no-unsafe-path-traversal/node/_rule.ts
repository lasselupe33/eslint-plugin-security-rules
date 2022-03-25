import { TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import { isIdentifier, isMemberExpression } from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { traceVariable } from "../../../utils/tracing/_trace-variable";
import { withTrace } from "../../../utils/tracing/callbacks/with-trace";
import { isImportTerminalNode } from "../../../utils/tracing/types/nodes";
import { printTrace } from "../../../utils/tracing/utils/print-trace";

import { addSanitationFix } from "./_utils/add-sanitation-fix";
import { isPathSafe } from "./_utils/is-path-safe";
import { fsSinks } from "./data";

/**
 * Progress
 *  [X] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

export enum MessageIds {
  VULNERABLE_PATH = "vulnerable-path",
  ADD_SANITATION_FIX = "add-sanitation-fix",
}

export type Config = {
  sanitation: {
    method: string;
    location: `{{root}}/${string}` | "{{inplace}}" | `{{abs}}:${string}`;
    defaultExport?: boolean;
  };
  root: `{{root}}` | `{{root}}/${string}` | `{{abs}}:${string}`;
};

export type RootConfig = string;

const createRule = RuleCreator(resolveDocsRoute);

/**
 * !!!
 */
export const noNodeUnsafePathTraversal = createRule<[Config], MessageIds>({
  name: "no-unsafe-path-traversal/node",
  defaultOptions: [
    {
      sanitation: {
        method: "sanitizePath",
        location: "{{inplace}}",
      },
      root: "{{root}}",
    },
  ],
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      [MessageIds.VULNERABLE_PATH]:
        "Path from external sources must be sanitized before usage",
      [MessageIds.ADD_SANITATION_FIX]:
        "Add sanitation before assigning unsafe value",
    },
    docs: {
      description: "TODO",
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
              method: { type: "string", required: true },
              filename: { type: "string", required: true },
            },
          },
          root: { type: "string", required: false },
        },
      },
    ],
  },
  create: (context, [config]) => {
    return {
      CallExpression: (node) => {
        const identifier =
          isMemberExpression(node.callee) && isIdentifier(node.callee.property)
            ? node.callee.property
            : isIdentifier(node.callee)
            ? node.callee
            : undefined;

        if (!identifier) {
          return;
        }

        // Most fs methods have synchronous analogues postfixed with 'Sync',
        // check if any of these have been used!
        const argumentsToCheck =
          fsSinks.get(identifier.name) ??
          fsSinks.get(identifier.name.replace("Sync", ""));

        // If we have no arguments to check, then this call expression is not
        // related to file system access using node/fs
        if (!argumentsToCheck || !isFsImport(context, node)) {
          return;
        }

        for (const argumentIndex of argumentsToCheck) {
          const isSafe = isPathSafe(node.arguments[argumentIndex], {
            context,
            config,
          });
          const unsafeArgument = node.arguments[argumentIndex];
          const cwd = context.getCwd?.();

          if (!isSafe && unsafeArgument && cwd) {
            context.report({
              node: unsafeArgument,
              messageId: MessageIds.VULNERABLE_PATH,
              suggest: [
                {
                  messageId: MessageIds.ADD_SANITATION_FIX,
                  fix(fixer) {
                    return addSanitationFix(
                      config,
                      context,
                      cwd,
                      fixer,
                      unsafeArgument
                    );
                  },
                },
              ],
            });
          }
        }
      },
    };
  },
});

function isFsImport(
  context: RuleContext<string, unknown[]>,
  node: TSESTree.CallExpression
): boolean {
  let isFsImport = false;

  traceVariable(
    {
      node: node.callee,
      context,
    },
    withTrace({
      onTraceFinished: (trace) => {
        const finalNode = trace[trace.length - 1];

        if (
          isImportTerminalNode(finalNode) &&
          ["fs", "fs/promises"].includes(finalNode.source)
        ) {
          isFsImport = true;
        }
        printTrace(trace);
      },
    })
  );

  return isFsImport;
}
