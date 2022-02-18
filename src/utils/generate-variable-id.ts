import { isPrimitive, isSymbol } from "./ast/guards";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ID_CACHE = new WeakMap<any, string>();
let AUTO_INCREMENTED_ID = 0;

/**
 * blazingly fast utility to create unique ids for any type of variables, which
 * can be used to create things such as cache keys or check for duplcates of
 * multiple inputs etc.
 *
 * uses a WeakMap under the hood to provide near-instant id generation and
 * caching for subsequent delivery of id on the same variable
 */
export function generateVariableId(variable: unknown): string {
  if (isPrimitive(variable)) {
    return `str:${String(variable)}`;
  }

  if (isSymbol(variable)) {
    return `sym:${variable.toString()}`;
  }

  let cacheKey = ID_CACHE.get(variable);

  if (!cacheKey) {
    cacheKey = `obj:${++AUTO_INCREMENTED_ID}`;
    ID_CACHE.set(variable, cacheKey);
  }

  return cacheKey;
}
