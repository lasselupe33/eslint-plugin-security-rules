import { TSESTree } from "@typescript-eslint/utils";

import { TypeProgram } from "./get-type-program";

export function getNodeModule(
  typeProgram: TypeProgram | undefined,
  node: TSESTree.Node
): { modulePath: string | undefined; functionName: string | undefined } {
  const tsNode = typeProgram?.parserServices.esTreeNodeToTSNodeMap.get(node);
  const type = tsNode
    ? typeProgram?.checker.getTypeAtLocation(tsNode)
    : undefined;

  return {
    modulePath: type?.symbol?.declarations?.[0]?.getSourceFile().fileName,
    functionName: type?.symbol?.escapedName.toString(),
  };
}
