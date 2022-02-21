import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleVariableDeclarator(
  ctx: HandlingContext,
  variableDeclarator: TSESTree.VariableDeclarator
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      nodeType: AST_NODE_TYPES.VariableDeclarator,
    },
  });

  return handleNode(nextCtx, variableDeclarator.init);
}
