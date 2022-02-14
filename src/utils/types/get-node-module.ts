import { Node } from "@typescript-eslint/types/dist/ast-spec";

import { TypeProgram } from "./get-type-program";

export function getNodeModule(
  typeProgram: TypeProgram | undefined,
  node: Node
) {
  const tsNode = typeProgram?.parserServices.esTreeNodeToTSNodeMap.get(node);
  const type = tsNode
    ? typeProgram?.checker.getTypeAtLocation(tsNode)
    : undefined;
  const symbol = type?.symbol;

  let fullyQualifiedName: string | undefined;
  // let moduleName: string | undefined;
  if (symbol) {
    fullyQualifiedName = typeProgram?.checker.getFullyQualifiedName(symbol);
    // Bad practice? TS warns against any
    // moduleName = (symbol as any).parent?.escapedName;
  }

  return {
    // Outcommented while testing fullyQualifiedName
    // sourceFile: type?.symbol.valueDeclaration?.parent.getSourceFile(),

    fullyQualifiedName: fullyQualifiedName,
  };
}
