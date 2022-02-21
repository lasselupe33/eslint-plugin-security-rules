import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { isImportDeclaration } from "./guards";
import { mapNodeToHandler } from "./map-node-to-handler";

type ImportMeta = {
  source: string;
  imported: string;
};

/**
 * Helper that extracts data from import nodes (i.e. what is being
 * imported, from where).
 *
 * This is kept as a utility since there exists different methods that allows
 * importing data (e.g. import .. from .. and require())
 */
export function getImportMeta(node: TSESTree.Node): ImportMeta | undefined {
  return mapNodeToHandler(node, {
    [AST_NODE_TYPES.ImportSpecifier]: (ctx, node) => {
      if (!isImportDeclaration(node.parent)) {
        return {
          source: "__unresolved__",
          imported: node.imported.name,
        };
      }

      return {
        source: node.parent.source.value,
        imported: node.imported.name,
      };
    },
  });
}
