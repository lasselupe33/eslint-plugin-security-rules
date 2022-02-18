// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HAS_WARNED = new Set<string>();

export function warnOnce<TArgs extends unknown[]>(
  cb: (...args: TArgs) => unknown[],
  ...args: TArgs
): void {
  if (process.env["NODE_ENV"] === "production") {
    return;
  }

  const key = args.reduce<string>(
    (acc, arg) => `${acc}&${arg}`,
    serializeValueCacheKey(cb)
  );

  if (!HAS_WARNED.has(key)) {
    HAS_WARNED.add(key);

    console.warn(...cb(...args));
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OBJECT_ID_CACHE = new WeakMap<any, string>();
let AUTO_INCREMENTED_ID = 0;

/**
 * blazingly fast utility to create serialized cache keys for any kind of value,
 * guaranteeing that referential equality is honered, but easily allowing
 * merging of multiple keys
 *
 * this becomes very valuable when a method needs to cache return values based
 * on multiple complex parameters
 *
 * uses a WeakMap under the hood to provide near-instant cache key generation
 * for complex objects without leaking memory when objects are released later
 * on.
 */
function serializeValueCacheKey(value: unknown): string {
  if (isPrimitive(value)) {
    return `str:${value}`;
  }

  if (isSymbol(value)) {
    return `sym:${value.toString()}`;
  }

  let cacheKey = OBJECT_ID_CACHE.get(value);

  if (!cacheKey) {
    cacheKey = `obj:${++AUTO_INCREMENTED_ID}`;
    OBJECT_ID_CACHE.set(value, cacheKey);
  }

  return cacheKey;
}

const RECORD_CACHE = new WeakMap<Record<string, unknown>, string>();

/**
 * utility to quickly serialize a combined cache key for an object, using
 * referential equality on the top-level values
 *
 * caches the result between iterations to optimize for load heavy scenarios
 * where recursive methods check the same object thousands of times in quick
 * succession
 */
export function serializeRecordCacheKey(
  obj: Record<string, unknown> | null
): string {
  if (obj === null) {
    return "null";
  }

  let cacheKey = RECORD_CACHE.get(obj);

  if (!cacheKey) {
    cacheKey = Object.entries(obj)
      // sort entries alphabetically by key (may not provide any actual benefits
      // tho?)
      .sort(([a], [b]) => {
        if (a > b) {
          return 1;
        }

        if (a < b) {
          return -1;
        }

        return 0;
      })

      // reduce the entries into a single cache key
      .reduce(
        (acc, [key, value]) => `${acc}&${key}=${serializeValueCacheKey(value)}`,
        ""
      );

    RECORD_CACHE.set(obj, cacheKey);
  }

  return cacheKey;
}

export function isPrimitive(
  value: unknown
): value is string | number | boolean | undefined | null {
  return (
    !value ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean"
  );
}

function isSymbol(value: unknown): value is symbol {
  return typeof value === "symbol";
}
