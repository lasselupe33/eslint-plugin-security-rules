import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { docsRoute } from "../../../constants";
import {
  isIdentifier,
  isLiteral,
  isMemberExpression,
} from "../../../utils/guards";

import { ASSIGNMENT_EXPRESSION_SINKS, RawSink, SinkTypes } from "./sinks";

// Notes: detect sinks, use multi-file determine flows to sources

enum MessageIds {
  TEST = "string",
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
      url: docsRoute(__dirname, __filename),
    },
    schema: {},
  },
  create: (context) => {
    console.log("???");
    return {
      AssignmentExpression: (node) => {
        const sinkType = isSink(node.left, ASSIGNMENT_EXPRESSION_SINKS);

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

    const remainingMatches = matchIn
      .filter(
        (sink) =>
          sink.identifier[sink.identifier.length - 1]?.name ===
          currentIdentifier
      )
      .map((sink) => ({
        ...sink,
        identifier: sink.identifier.slice(0, -1),
      }));

    return isSink(expression.object, remainingMatches);
  }
}
