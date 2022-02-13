import { Node } from "@typescript-eslint/types/dist/ast-spec";

import { TypeProgram } from "./get-type-program";

export function getNodeType(typeProgram: TypeProgram | undefined, node: Node) {
  const tsNode = typeProgram?.parserServices.esTreeNodeToTSNodeMap.get(node);
  const type = tsNode
    ? typeProgram?.checker.getTypeAtLocation(tsNode)
    : undefined;
  const signatures = type?.getCallSignatures();

  const symbol = type?.symbol;

  let fullyQualifiedName: string | undefined;
  let moduleName: string | undefined;
  if (symbol) {
    fullyQualifiedName = typeProgram?.checker.getFullyQualifiedName(symbol);
    // Bad practice? TS warns against any
    moduleName = (symbol as any).parent?.escapedName;
  }

  return {
    typeName: type?.symbol?.escapedName as unknown as string,

    // Outcommented while testing fullyQualifiedName
    // sourceFile: type?.symbol.valueDeclaration?.parent.getSourceFile(),

    fullyQualifiedName: fullyQualifiedName,

    moduleName: moduleName,

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
  };
}
