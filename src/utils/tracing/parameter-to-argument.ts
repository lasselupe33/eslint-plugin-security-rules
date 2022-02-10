import { CallExpressionArgument } from "@typescript-eslint/types/dist/ast-spec";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

type Argument = {
  argument: CallExpressionArgument | undefined;
  scope: Scope.Scope;
};

export type ParameterToArgumentMap = Map<string, Argument>;

const incMap: Record<string, number> = {};

export function toParameterToArgumentKey(
  functionName: string,
  parameterName: string,
  type: "set" | "get"
): string {
  const baseKey = `${functionName}-${parameterName}`;

  if (!incMap[baseKey]) {
    incMap[baseKey] = 0;
  }

  const id = type === "set" ? incMap[baseKey]++ : --incMap[baseKey];

  return `${baseKey}-${id}`;
}
