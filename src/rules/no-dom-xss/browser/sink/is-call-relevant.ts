import { TSESTree } from "@typescript-eslint/utils";

import { isLiteral } from "../../../../utils/guards";

import { CallExpressionSink } from "./data";

export function isCallRelevant(
  args: TSESTree.CallExpressionArgument[],
  matchIn: CallExpressionSink[]
): CallExpressionSink[] {
  return matchIn.filter((sink) => {
    if (!validateIfPredicate(sink, args)) {
      return false;
    }

    // @TODO: Implement source checking
    return true;
  });
}

function validateIfPredicate(
  sink: CallExpressionSink,
  args: TSESTree.CallExpressionArgument[]
): boolean {
  if (!sink.if) {
    return true;
  }

  const argumentNode = args[sink.if?.paramaterIndex];

  let argumentName = "__unknown__";

  // @TODO: Check all relevant nodes
  if (isLiteral(argumentNode)) {
    argumentName = String(argumentNode.value);
  }

  return sink.if.isPrefix
    ? argumentName.startsWith(sink.if.equals)
    : argumentName === sink.if.equals;
}
