import path from "path";

import fs from "fs-extra";

const CACHE_PATH = path.join(
  path.dirname(require.resolve("eslint-plugin-security-rules")),
  ".cache"
);

type Options = {
  useFileSystem?: boolean;
};

export function createCache<T>({ useFileSystem }: Options = {}) {
  const memCache = new Map<string, T>();

  if (useFileSystem) {
    fs.mkdirpSync(CACHE_PATH);
  }

  return {
    del: (input: string): void => {
      const key = convertInputToKey(input);
      memCache.delete(key);

      if (useFileSystem) {
        fs.unlink(path.join(CACHE_PATH, key));
      }
    },
    set: (input: string, value: T): void => {
      const key = convertInputToKey(input);
      memCache.set(key, value);

      if (useFileSystem) {
        try {
          fs.writeFile(path.join(CACHE_PATH, key), JSON.stringify(value), {
            encoding: "utf-8",
          });
        } catch (err) {
          // Silently fail
        }
      }
    },
    get: (input: string): T | undefined => {
      const key = convertInputToKey(input);
      const cachedVal = memCache.get(key);

      if (cachedVal) {
        return cachedVal;
      } else if (useFileSystem) {
        try {
          return JSON.parse(
            fs.readFileSync(path.join(CACHE_PATH, key), "utf-8")
          ) as T;
        } catch (err) {
          // Silently fail..
          return undefined;
        }
      }
    },
  };
}

function convertInputToKey(input: string): string {
  return encodeURIComponent(input);
}
