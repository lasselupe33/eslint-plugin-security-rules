import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { mapNodeToHandler } from "../../../../utils/map-node-to-handler";

export function extractIdentifier(
  node: TSESTree.Node
): TSESTree.Identifier | undefined {
  const cases = mapNodeToHandler(node, {
    [AST_NODE_TYPES.Identifier]: (ctx, identifier) => identifier,
    [AST_NODE_TYPES.MemberExpression]: (ctx, memberExp) =>
      extractIdentifier(memberExp.property),
    [AST_NODE_TYPES.CallExpression]: (ctx, callExp) =>
      extractIdentifier(callExp.callee),
  });

  return cases;
}
