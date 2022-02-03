import { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { isIdentifier, isMemberExpression } from "../../../utils/guards";
import { resolveDocsRoute } from "../../../utils/resolveDocsRoute";
import { getNodeType } from "../../../utils/types/getNodeType";
import {
  getTypeProgram,
  TypeProgram,
} from "../../../utils/types/getTypeProgram";

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
    const typeProgram = getTypeProgram(context);

    return {
      AssignmentExpression: (node) => {
        const sinkType = isSink(
          typeProgram,
          node.left,
          ASSIGNMENT_EXPRESSION_SINKS
        );

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
      // CallExpression: (node) => {},
      // NewExpression: (node) => {},
    };
  },
};

function isSink<Sink extends RawSink>(
  typeProgram: TypeProgram,
  expression: TSESTree.Expression,
  matchIn: Sink[]
): SinkTypes | undefined {
  if (isIdentifier(expression)) {
    const sink = findConclusionSink(
      typeProgram,
      expression,
      expression.name,
      matchIn
    );

    return sink?.type;
  } else if (
    isMemberExpression(expression) &&
    isIdentifier(expression.property)
  ) {
    const remainingMatches = findMatchingSinks(
      typeProgram,
      expression,
      expression.property.name,
      matchIn
    );

    return isSink(typeProgram, expression.object, remainingMatches);
  }
}

function findMatchingSinks<Sink extends RawSink>(
  typeProgram: TypeProgram,
  node: TSESTree.Expression,
  currentIdentifierName: string,
  matchIn: Sink[]
) {
  return matchIn
    .filter((sink) =>
      isSinkRelevant(typeProgram, node, currentIdentifierName, sink)
    )
    .map((sink) => ({
      ...sink,
      identifier: sink.identifier.slice(0, -1),
    }));
}

const GLOBALS = ["globalThis", "window", "document"];

function findConclusionSink<Sink extends RawSink>(
  typeProgram: TypeProgram,
  node: TSESTree.Expression,
  currentIdentifierName: string,
  matchIn: Sink[]
) {
  return matchIn.find(
    (sink) =>
      (sink.identifier.length === 0 &&
        GLOBALS.includes(currentIdentifierName)) ||
      (sink.identifier.length === 1 &&
        isSinkRelevant(typeProgram, node, currentIdentifierName, sink))
  );
}

function isSinkRelevant<Sink extends RawSink>(
  typeProgram: TypeProgram,
  node: TSESTree.Expression,
  currentIdentifierName: string,
  sink: Sink
): boolean {
  const relevantSinkIdentifier = sink.identifier[sink.identifier.length - 1];

  if (!relevantSinkIdentifier) {
    return false;
  }

  // In case the current sink identifier should not be matched on its name,
  // then we fall back to attempt to parse it based on its type information
  if (relevantSinkIdentifier.name === "__irrelevant__") {
    const type = getNodeType(typeProgram, node);

    // In case we cannot extract type information then we should fall back
    // to simply assuming the type matches (Prefer false positives over
    // false negatives)
    if (type === undefined) {
      return true;
    }

    return type === relevantSinkIdentifier.type;
  }

  const isMatchBasedOnName = relevantSinkIdentifier?.isPrefix
    ? relevantSinkIdentifier?.name.startsWith(currentIdentifierName)
    : relevantSinkIdentifier?.name === currentIdentifierName;

  return isMatchBasedOnName;
}
