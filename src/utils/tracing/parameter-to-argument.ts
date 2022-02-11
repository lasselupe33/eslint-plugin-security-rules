import { CallExpressionArgument } from "@typescript-eslint/types/dist/ast-spec";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

type Argument = {
  argument: CallExpressionArgument | undefined;
  scope: Scope.Scope;
};

export type ParameterToArgumentMap = Map<string, Argument>;

const setMap: Record<string, number> = {};
const getMap: Record<string, number> = {};

/**
 * When inserting entries into the ParameterToArgument map we must generate
 * unique keys extractable when we only have the context of the parameter and
 * the function being called.
 *
 * This in itself can prove fairly tricky if the same function is executed
 * multiple times in the same scope (how do we tell these apart when we only
 * have our map, the parameter and the function?).
 * Since we know that tracing will be done in order, then we can have an
 * automatically incremented id on insertions and decremntions of the id when
 * extracting keys.
 *
 *
 * E.g. consider the following snippet:
 *
 * function basic(arg: string): string { return arg };
 *
 * basic("hello")
 * basic("world")
 *
 * This will produce the following keys:
 *
 * "basic-arg-0" -> "hello"
 * "basic-arg-1" -> "world"
 *
 * Which in term will be extracted in the same order when given the same
 * parameter and funciton.
 */
export function toParameterToArgumentKey(
  functionName: string,
  parameterName: string,
  type: "set" | "get"
): string {
  const baseKey = `${functionName}-${parameterName}`;
  let id = 0;

  if (type === "set") {
    if (!setMap[baseKey]) {
      setMap[baseKey] = 0;
    }

    id = setMap[baseKey]++;
  }

  if (type === "get") {
    if (!getMap[baseKey]) {
      getMap[baseKey] = 0;
    }

    id = getMap[baseKey]++;
  }

  return `${baseKey}-${id}`;
}
