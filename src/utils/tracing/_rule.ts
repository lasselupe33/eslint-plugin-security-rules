import fs from "fs";

import { TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { resolveDocsRoute } from "../resolve-docs-route";

import { traceVariable } from "./_trace-variable";
import { makeTraceCallbacksWithTrace } from "./callbacks/with-current-trace";
import { printTrace } from "./utils/print-trace";
import { terminalsToSourceString } from "./utils/terminals-to-source-string";

export enum MessageIds {
  FAILED_TRACE = "failed-trace",
}

const createRule = RuleCreator(resolveDocsRoute);

/**
 * ...
 */
export const traceTestRule = createRule<[], MessageIds>({
  name: "tracing/test",
  defaultOptions: [],
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      [MessageIds.FAILED_TRACE]:
        "Failed to receive expected output. Got '{{ received }}'",
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
          makeTraceCallbacksWithTrace({
            onTraceFinished: (trace) => {
              printTrace(trace);
            },
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
                  context.getFilename().replace(/\.[^.]*$/, ".expected"),
                  "utf8"
                )
                .split("\n");

              if (terminalGroups.length !== expectedStrings.length) {
                context.report({
                  node,
                  messageId: MessageIds.FAILED_TRACE,
                  data: {
                    received: "expected vs. output length mismatch",
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
