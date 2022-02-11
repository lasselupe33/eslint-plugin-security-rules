import { Node } from "@typescript-eslint/types/dist/ast-spec";

import { TypeProgram } from "./get-type-program";

export function getNodeType(typeProgram: TypeProgram | undefined, node: Node) {
  const tsNode = typeProgram?.parserServices.esTreeNodeToTSNodeMap.get(node);
  const type = tsNode
    ? typeProgram?.checker.getTypeAtLocation(tsNode)
    : undefined;
  const signatures = type?.getCallSignatures();

  return {
    typeName: type?.symbol?.escapedName as unknown as string,

    baseTypeNames:
      type
        ?.getBaseTypes()
        ?.map((type) => type.symbol?.escapedName as unknown as string) ?? [],

    returnTypeNames:
      signatures?.map(
        (signature) =>
          typeProgram?.checker.getReturnTypeOfSignature(signature)?.symbol
            ?.escapedName as unknown as string
      ) ?? [],

    sourceFile: type?.symbol.valueDeclaration?.parent.getSourceFile(),
  };
}
