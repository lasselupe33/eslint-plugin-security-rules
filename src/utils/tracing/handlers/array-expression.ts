import { TSESTree } from "@typescript-eslint/utils";

import { isArrayExpression, isSpreadElement } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { traceVariable } from "../_trace-variable";
import { withTrace } from "../callbacks/with-trace";
import { HandlingContext } from "../types/context";
import {
  isNodeTerminalNode,
  makeNodeTerminalNode,
  TraceNode,
} from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleArrayExpression(
  ctx: HandlingContext,
  arrayExpression: TSESTree.ArrayExpression
): TraceNode[] {
  const { memberPath, forceFollowAllProperties } = ctx.meta;
  const astNodes = [...ctx.connection.astNodes, arrayExpression];

  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, arrayExpression],
    },
    meta: {
      memberPath: memberPath.slice(0, -1),
    },
  });

  if (forceFollowAllProperties) {
    return arrayExpression.elements.flatMap((elm) => handleNode(nextCtx, elm));
  }

  // In case we're not attempting to resolve a specific value in the array
  // expression, then we must simply resolve the array as a terminal
  if (memberPath.length === 0) {
    return [
      makeNodeTerminalNode({
        astNodes,
        astNode: arrayExpression,
        connection: ctx.connection,
        meta: ctx.meta,
      }),
    ];
  }

  const targetIndex = Number(memberPath[memberPath.length - 1]);
  let currIndex = 0;

  if (!Number.isNaN(targetIndex)) {
    for (const element of arrayExpression.elements) {
      if (isSpreadElement(element)) {
        const arrays: TSESTree.ArrayExpression[] = [];

        traceVariable(
          {
            node: element,
            context: nextCtx.ruleContext,
          },
          withTrace({
            onTraceFinished: (trace) => {
              const finalNode = trace[trace.length - 1];
              if (
                isNodeTerminalNode(finalNode) &&
                isArrayExpression(finalNode.astNode)
              )
                arrays.push(finalNode.astNode);
            },
          }),
          {
            maxCycles: 5,
            encounteredMap: ctx.encounteredMap,
          }
        );

        // In case we were not able to resolve the spread element, then we
        // cannot reliably count to the desired index, in this case we fall back
        // to scanning the whole array
        if (arrays.length === 0) {
          break;
        }

        const spreadIndex = targetIndex - currIndex;
        currIndex += Math.min(...arrays.map((it) => it.elements.length));

        if (currIndex > targetIndex) {
          return arrays
            .filter((it) => !nextCtx.meta.encounteredSpreadElements.has(it))
            .flatMap((it) =>
              handleNode(
                deepMerge(nextCtx, {
                  meta: {
                    memberPath: [
                      ...nextCtx.meta.memberPath,
                      String(spreadIndex),
                    ],
                    encounteredSpreadElements: new WeakMap([[it, true]]),
                  },
                }),
                it
              )
            );
        }
      } else {
        if (currIndex === targetIndex) {
          return handleNode(nextCtx, element);
        }

        currIndex++;
      }
    }
  }

  // If we get here, then we have not been able to resolve which part of the
  // array is relevant. In this case we fallback to attempting to determine if
  // the whole array is safe.
  return arrayExpression.elements.flatMap((elm) =>
    handleNode(
      deepMerge(nextCtx, { meta: { forceFollowAllProperties: true } }),
      elm
    )
  );
}
