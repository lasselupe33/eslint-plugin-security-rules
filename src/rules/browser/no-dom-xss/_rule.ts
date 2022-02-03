import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { isIdentifier, isMemberExpression } from "../../../utils/guards";
import { resolveDocsRoute } from "../../../utils/resolveDocsRoute";

import { ASSIGNMENT_EXPRESSION_SINKS, RawSink, SinkTypes } from "./sinks";

/**
 * Blablabla
 *
 * 1. Implement detection
 * 2. Implement fix/suggestions
 * 3. Implement methods to reduce false positives
 */

// Notes: detect sinks, use multi-file determine flows to sources

enum MessageIds {
  TEST = "test",
}

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
    return {
      AssignmentExpression: (node) => {
        const sinkType = isSink(node.left, ASSIGNMENT_EXPRESSION_SINKS);
        console.log("");

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
      CallExpression: (node) => {},
      NewExpression: (node) => {},
    };
  },
};

function isSink<Sink extends RawSink>(
  expression: TSESTree.Expression,
  matchIn: Sink[]
): SinkTypes | undefined {
  let currentIdentifier = "";

  if (isIdentifier(expression)) {
    currentIdentifier = expression.name;

    const sink = matchIn.find(
      (sink) =>
        (sink.identifier.length === 0 &&
          (currentIdentifier === "globalThis" ||
            currentIdentifier === "window")) ||
        (sink.identifier.length === 1 &&
          sink.identifier[0]?.name === currentIdentifier)
    );

    return sink?.type;
  } else if (
    isMemberExpression(expression) &&
    isIdentifier(expression.property)
  ) {
    currentIdentifier = expression.property.name;

    const remainingMatches = findMatchingSinks(
      expression,
      expression.property.name,
      ASSIGNMENT_EXPRESSION_SINKS
    );

    return isSink(expression.object, remainingMatches);
  }
}

function findMatchingSinks<Sink extends RawSink>(
  node: TSESTree.Expression,
  currentIdentifierName: string,
  matchIn: Sink[]
) {
  return matchIn
    .filter(
      (sink) =>
        sink.identifier[sink.identifier.length - 1]?.name ===
        currentIdentifierName
    )
    .map((sink) => ({
      ...sink,
      identifier: sink.identifier.slice(0, -1),
    }));
}

const GLOBALS = ["globalThis", "window"];

function findConclusionSink<Sink extends RawSink>(
  node: TSESTree.Expression,
  currentIdentifierName: string,
  matchIn: Sink[]
) {
  return matchIn.find(
    (sink) =>
      (sink.identifier.length === 0 &&
        GLOBALS.includes(currentIdentifierName)) ||
      (sink.identifier.length === 1 &&
        sink.identifier[0]?.name === currentIdentifierName)
  );
}
