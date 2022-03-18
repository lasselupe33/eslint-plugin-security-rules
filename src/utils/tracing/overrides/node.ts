import { TSESTree } from "@typescript-eslint/utils";

import { isIdentifier } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { getNodeModule } from "../../types/get-node-module";
import { getTypeProgram } from "../../types/get-type-program";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import { isVariableNode, TraceNode } from "../types/nodes";

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
  const typeProgram = getTypeProgram(ctx.ruleContext);
  const moduleName = getNodeModule(typeProgram, callExpression.callee);

  if (!moduleName?.includes("@types/node/path")) {
    return;
  }

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
      ].includes(pathFunctionIdentifier.name)
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
