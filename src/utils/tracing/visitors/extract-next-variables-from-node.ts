import { TSESTree } from "@typescript-eslint/utils";

import { isAssignmentExpression, isVariableDeclarator } from "../../guards";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext, TraceNode } from "../types";

export function extractNextVariablesFromNode(
  ctx: HandlingContext,
  node: TSESTree.Node | undefined
): TraceNode[] {
  if (isVariableDeclarator(node)) {
    return handleNode(ctx, node.init);
  } else if (isAssignmentExpression(node)) {
    return handleNode(ctx, node.right);
  }

  console.warn(
    `traceVariable.extractVariablesFromNode(): Unhandled node.`,
    node?.type
  );

  return [];
}
