type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

const keysToSkip = [
  "variable",
  "astNode",
  "scope",
  "rootScope",
  "encounteredSpreadElements",
];

export function deepMerge<T extends Record<string, unknown>>(
  a: T,
  b: DeepPartial<T>
): T {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const merged: Record<string, unknown> = {};

  for (const key of keys) {
    const aValue = a[key];
    const bValue = b[key];

    if (isObject(aValue)) {
      merged[key] =
        key in b
          ? !keysToSkip.includes(key) && isObject(bValue)
            ? deepMerge(aValue, bValue)
            : bValue
          : aValue;
    } else {
      merged[key] = key in b ? bValue : aValue;
    }
  }

  return merged as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}
