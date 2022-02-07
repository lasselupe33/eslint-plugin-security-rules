import { Node } from "@typescript-eslint/types/dist/ast-spec";

import { TypeProgram } from "./getTypeProgram";

export function getNodeType(
  typeProgram: TypeProgram | undefined,
  node: Node
): { typeName: string | undefined; baseTypeNames: string[] } {
  const tsNode = typeProgram?.parserServices.esTreeNodeToTSNodeMap.get(node);
  const type = tsNode
    ? typeProgram?.checker.getTypeAtLocation(tsNode)
    : undefined;

  return {
    typeName: type?.symbol?.escapedName as unknown as string,
    baseTypeNames:
      type
        ?.getBaseTypes()
        ?.map((type) => type.symbol?.escapedName as unknown as string) ?? [],
  };
}
