import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { mapNodeToHandler } from "../mapNodeToHandler";

export function getNodeName(node: TSESTree.Node | undefined): string {
  return (
    mapNodeToHandler(node, {
      [AST_NODE_TYPES.Identifier]: (ctx, ident) => ident.name,
      [AST_NODE_TYPES.Literal]: (ctx, literal) => String(literal.value),
    }) ?? ""
  );
}
