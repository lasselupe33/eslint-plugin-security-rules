import { TSESTree } from "@typescript-eslint/utils";

import { TypeProgram } from "./getTypeProgram";

export function getNodeType(
  typeProgram: TypeProgram | undefined,
  node: TSESTree.Node
): string | undefined {
  const tsNode = typeProgram?.parserServices.esTreeNodeToTSNodeMap.get(node);
  return tsNode
    ? (typeProgram?.checker.getTypeAtLocation(tsNode).symbol?.escapedName as
        | string
        | undefined)
    : undefined;
}
