import { TSESTree } from "@typescript-eslint/utils";
import { SourceCode } from "@typescript-eslint/utils/dist/ts-eslint";

export function getFinalRange(
  sourceCode: SourceCode
): TSESTree.Range | undefined {
  return sourceCode.ast.tokens[sourceCode.ast.tokens.length - 1]?.range;
}
