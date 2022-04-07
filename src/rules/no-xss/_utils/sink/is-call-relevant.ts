import { TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import {
  withTrace,
  Trace,
} from "../../../../utils/tracing/callbacks/with-trace";
import { isConstantTerminalNode } from "../../../../utils/tracing/types/nodes";

import { CallExpressionSink } from "./types";

/**
 * Checks to see if the matched call expression is relevant to any of the
 * potential sinks provided, by checking if the call matches any of the sink
 * predicates.
 */
export function isCallRelevant(
  context: RuleContext<string, unknown[]>,
  args: TSESTree.CallExpressionArgument[],
  matchIn: CallExpressionSink[]
): CallExpressionSink[] {
  return matchIn.filter((sink) => validateIfPredicate(context, sink, args));
}

function validateIfPredicate(
  context: RuleContext<string, unknown[]>,
  sink: CallExpressionSink,
  args: TSESTree.CallExpressionArgument[]
): boolean {
  if (!sink.if) {
    return true;
  }

  const argumentNode = args[sink.if?.paramaterIndex];

  if (!argumentNode) {
    return true;
  }

  const traces: Trace[] = [];

  // We use our variable tracer to determine all possible names that the value
  // we need to check against can take.
  if (argumentNode) {
    traceVariable(
      {
        node: argumentNode,
        context,
      },
      withTrace({
        onTraceFinished: (trace) => {
          traces.push(trace);
        },
      })
    );
  }

  // @TODO: determine if we want to merge the potential value of a trace into a
  // single string instead of only considering the terminal node.
  const argumentNames = traces
    .map((trace) => {
      const lastNode = trace[trace.length - 1];
      return isConstantTerminalNode(lastNode) ? lastNode.value : undefined;
    })
    .filter((it): it is string => it !== undefined);

  const predicate = sink.if;

  // In case just one trace matches our predicate, then we have a match since
  // this trace can potentially be vulnerable.
  return sink.if.isPrefix
    ? argumentNames.some((name) => name.startsWith(predicate.equals))
    : argumentNames.some((name) => name === predicate.equals);
}
