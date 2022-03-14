import { TSESTree } from "@typescript-eslint/utils";

import { HandlingContext } from "../types/context";
import { makeNodeTerminalNode, TraceNode } from "../types/nodes";

export function handleImportDeclaration(
  ctx: HandlingContext,
  importDeclaration: TSESTree.ImportDeclaration
): TraceNode[] {
  return [
    makeNodeTerminalNode({
      astNodes: [...ctx.connection.astNodes, importDeclaration],
      astNode: importDeclaration,
      connection: ctx.connection,
      meta: ctx.meta,
    }),
  ];
}
