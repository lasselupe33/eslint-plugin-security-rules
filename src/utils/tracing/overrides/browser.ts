import { TSESTree } from "@typescript-eslint/utils";

import {
  isIdentifier,
  isMemberExpression,
  isSpreadElement,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

/**
 * Helper to determine if the current call should result in a custom override.
 *
 * Overrides can be useful to handle naitve JS API's such as arr.join() which
 * alters the default way we need to follow variables.
 */
export function handleBrowserOverrides(
  ctx: HandlingContext,
  callExpression: TSESTree.CallExpression
): TraceNode[] | undefined {
  if (
    isMemberExpression(callExpression.callee) &&
    isIdentifier(callExpression.callee.property)
  ) {
    switch (callExpression.callee.property.name) {
      case "join":
        return handleNode(
          deepMerge(ctx, {
            meta: { forceFollowObjectProperties: true },
          }),
          callExpression.callee.object
        );

      case "concat":
        return [
          ...handleNode(ctx, callExpression.callee.object),
          ...callExpression.arguments
            .flatMap((arg) => {
              if (!isSpreadElement(arg)) {
                return handleNode(ctx, arg);
              }
            })
            .filter((it): it is TraceNode => !!it),
        ];

      case "values": {
        if (
          isIdentifier(callExpression.callee.object) &&
          callExpression.callee.object.name === "Object"
        ) {
          return handleNode(
            deepMerge(ctx, {
              meta: {
                forceFollowObjectProperties: true,
              },
            }),
            callExpression.arguments[0]
          );
        }
      }
    }
  }
}
