import { TSESTree } from "@typescript-eslint/utils";

import { isIdentifier } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { getNodeModule } from "../../types/get-node-module";
import { getTypeProgram } from "../../types/get-type-program";
import { traceVariable } from "../_trace-variable";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import {
  isImportTerminalNode,
  isVariableNode,
  TraceNode,
} from "../types/nodes";

/**
 * Helper to determine if the current call should result in a custom override.
 */
export function handleNodeOverrides(
  ctx: HandlingContext,
  callExpression: TSESTree.CallExpression,
  calleeIdentifiers: TraceNode[]
): TraceNode[] | undefined {
  return handlePathOverrides(ctx, callExpression, calleeIdentifiers);
}

function handlePathOverrides(
  ctx: HandlingContext,
  callExpression: TSESTree.CallExpression,
  calleeIdentifiers: TraceNode[]
): TraceNode[] | undefined {
  return calleeIdentifiers.flatMap((identifier) => {
    const pathFunctionIdentifier =
      identifier.astNodes[identifier.astNodes.length - 2];

    if (
      !isVariableNode(identifier) ||
      !isIdentifier(pathFunctionIdentifier) ||
      ![
        "resolve",
        "join",
        "normalize",
        "relative",
        "dirname",
        "basename",
        "extname",
        "parse",
        "toNamespacedPath",
      ].includes(pathFunctionIdentifier.name) ||
      !isNodeJSPathCall(ctx, callExpression)
    ) {
      return [];
    }

    return callExpression.arguments.flatMap((it) =>
      handleNode(
        deepMerge(ctx, {
          connection: {
            astNodes: [...ctx.connection.astNodes, ...identifier.astNodes],
          },
        }),
        it
      )
    );
  });
}

const callCache = new WeakMap<TSESTree.CallExpression, boolean>();

function isNodeJSPathCall(
  ctx: HandlingContext,
  callExpression: TSESTree.CallExpression
) {
  if (callCache.has(callExpression)) {
    return callCache.get(callExpression);
  }

  const typeProgram = getTypeProgram(ctx.ruleContext);
  let isMatch = false;

  if (typeProgram) {
    const { modulePath: moduleName } = getNodeModule(
      typeProgram,
      callExpression.callee
    );

    isMatch = !!moduleName?.includes("@types/node/path");
  } else {
    traceVariable(
      { node: callExpression.callee, context: ctx.ruleContext },
      {
        onNodeVisited: (node) => {
          if (isImportTerminalNode(node) && node.source === "path") {
            isMatch = true;

            return { halt: true };
          }
        },
      },
      { maxCycles: 5, encounteredMap: ctx.encounteredMap }
    );
  }

  callCache.set(callExpression, isMatch);
  return isMatch;
}
