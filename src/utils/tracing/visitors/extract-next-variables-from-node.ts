import { TSESTree } from "@typescript-eslint/utils";

import { isAssignmentExpression, isVariableDeclarator } from "../../ast/guards";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

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
