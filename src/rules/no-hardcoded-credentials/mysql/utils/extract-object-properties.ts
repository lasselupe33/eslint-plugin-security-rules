import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { mapNodeToHandler } from "../../../../utils/map-node-to-handler";

export function extractObjectProperties(
  node: TSESTree.Node | undefined
): TSESTree.ObjectLiteralElement[] | undefined {
  const cases = mapNodeToHandler(node, {
    [AST_NODE_TYPES.ObjectExpression]: (ctx, objExp) => objExp.properties,
    [AST_NODE_TYPES.CallExpression]: (ctx, callExp) =>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      extractObjectProperties(callExp.arguments[0]),
  });

  return cases;
}
