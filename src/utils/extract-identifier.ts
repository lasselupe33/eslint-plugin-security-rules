import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { makeMapNodeToHandler } from "./ast/map-node-to-handler";

const mapNodeToHandler = makeMapNodeToHandler({ disableWarnings: true });

export function extractIdentifier(node: TSESTree.Node): TSESTree.Identifier[] {
  const cases = mapNodeToHandler(node, {
    [AST_NODE_TYPES.Identifier]: (ctx, identifier) => [identifier],
    [AST_NODE_TYPES.MemberExpression]: (ctx, memberExp) => [
      ...extractIdentifier(memberExp.object),
      ...extractIdentifier(memberExp.property),
    ],
    [AST_NODE_TYPES.CallExpression]: (ctx, callExp) =>
      extractIdentifier(callExp.callee),
  });

  return cases ?? [];
}
