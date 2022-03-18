import { Node } from "@typescript-eslint/types/dist/ast-spec";

import { TypeProgram } from "./get-type-program";

export function getNodeModule(
  typeProgram: TypeProgram | undefined,
  node: Node
): string | undefined {
  const tsNode = typeProgram?.parserServices.esTreeNodeToTSNodeMap.get(node);
  const type = tsNode
    ? typeProgram?.checker.getTypeAtLocation(tsNode)
    : undefined;

  return type?.symbol?.declarations?.[0]?.getSourceFile().fileName;
}
