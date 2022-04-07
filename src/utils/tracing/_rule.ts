import fs from "fs";

import { TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { resolveDocsRoute } from "../resolve-docs-route";
import { sanitizePath } from "../sanitize-path";

import { traceVariable } from "./_trace-variable";
import { withTrace } from "./callbacks/with-trace";
import { terminalsToSourceString } from "./utils/terminals-to-source-string";

export enum MessageIds {
  FAILED_TRACE = "failed-trace",
}

const createRule = RuleCreator(resolveDocsRoute);

/**
 * Allows the tracer to run on the value that the variable "start" is assigned
 * to. This allows for easy creating of unit-tests for the tracer.
 */
export const traceTestRule = createRule<[], MessageIds>({
  name: "tracing/test",
  defaultOptions: [],
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      [MessageIds.FAILED_TRACE]:
        "Failed to receive expected output. Got '{{ received }}, expected {{ expected }}'",
    },
    docs: {
      description: "Internal testing of the trace algorithm",
      recommended: "error",
    },
    schema: [],
  },
  create: (context) => {
    return {
      "VariableDeclarator[id.name='start']": (
        node: TSESTree.VariableDeclarator
      ) => {
        traceVariable(
          {
            node: node.init,
            context,
          },
          withTrace({
            onFinished: (terminalGroups) => {
              if (!terminalGroups.length) {
                context.report({
                  node,
                  messageId: MessageIds.FAILED_TRACE,
                  data: {
                    received: "undefined",
                  },
                });
              }

              const expectedStrings = fs
                .readFileSync(
                  sanitizePath(
                    __dirname,
                    "../../../",
                    context.getFilename().replace(/\.[^.]*$/, ".expected")
                  ),
                  "utf8"
                )
                .split("\n")
                .map((it) => it.trim())
                .filter((it) => !!it);

              if (terminalGroups.length !== expectedStrings.length) {
                context.report({
                  node,
                  messageId: MessageIds.FAILED_TRACE,
                  data: {
                    received: `invalid output length (${terminalGroups.length})`,
                    expected: `(${expectedStrings.length})`,
                  },
                });
              }

              for (let i = 0; i < terminalGroups.length; i++) {
                const terminals = terminalGroups[i];
                const expected = expectedStrings[i];

                if (!terminals || !expected) {
                  continue;
                }

                const received = terminalsToSourceString(terminals);

                if (received !== expected) {
                  context.report({
                    node,
                    messageId: MessageIds.FAILED_TRACE,
                    data: {
                      received,
                      expected,
                    },
                  });
                }
              }
            },
          })
        );
      },
    };
  },
});
