import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { isIdentifier } from "../../ast/guards";
import { mapNodeToHandler } from "../../ast/map-node-to-handler";

export function getNodeName(node: TSESTree.Node | undefined): string {
  return (
    mapNodeToHandler(node, {
      [AST_NODE_TYPES.Identifier]: (ctx, ident) => ident.name,
      [AST_NODE_TYPES.Literal]: (ctx, literal) => String(literal.value),
      [AST_NODE_TYPES.CallExpression]: (ctx, callExpression) =>
        isIdentifier(callExpression.callee)
          ? callExpression.callee.name
          : undefined,
    }) ?? ""
  );
}
