import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { makeNodeTerminalNode, TraceNode } from "../types/nodes";

export function handleImportDeclaration(
  ctx: HandlingContext,
  importDeclaration: TSESTree.ImportDeclaration
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      nodeType: AST_NODE_TYPES.ImportDeclaration,
    },
  });

  const terminalNode = makeNodeTerminalNode({
    node: importDeclaration,
    nodeType: importDeclaration.type,
    connection: nextCtx.connection,
  });

  return [terminalNode];
}
