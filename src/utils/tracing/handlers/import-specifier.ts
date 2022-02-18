import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleImportSpecifier(
  ctx: HandlingContext,
  importSpecifier: TSESTree.ImportSpecifier
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      nodeType: AST_NODE_TYPES.ImportSpecifier,
    },
  });

  const imported = importSpecifier.imported.name;
  const source = handleNode(nextCtx, importSpecifier.parent)[0];

  return [];
}
