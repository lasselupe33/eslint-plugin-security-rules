import { CallExpressionArgument } from "@typescript-eslint/types/dist/ast-spec";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

type Argument = {
  argument: CallExpressionArgument | undefined;
  scope: Scope.Scope;
};

export type ParameterToArgumentMap = Map<string, Argument>;

/**
 * Simple helper that ensure keys to the parameterToArgumentMap are correct
 */
export function toParameterToArgumentKey(
  functionName: string,
  parameterName: string
): string {
  return `${functionName}-${parameterName}`;
}
