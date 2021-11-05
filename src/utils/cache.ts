const memCache = new Map<string, unknown>();

export function del(filePath: string): void {
  const key = convertPathToKey(filePath);

  memCache.delete(key);
}

export function set(filePath: string, obj: unknown): void {
  const key = convertPathToKey(filePath);

  memCache.set(key, obj);
}

export function get<T>(filePath: string): T | undefined {
  const key = convertPathToKey(filePath);

  try {
    const memCached = memCache.get(key) as T | undefined;

    if (memCached) {
      return memCached;
    }

    return undefined;
  } catch (err) {
    console.warn(err);

    return undefined;
  }
}

function convertPathToKey(path: string): string {
  // return encodeURIComponent(path);
  return path;
}
