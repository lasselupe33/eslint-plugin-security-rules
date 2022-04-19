import crypto from "crypto";
import path from "path";

import fs from "fs-extra";

const CACHE_PATH = path.join(path.dirname(__dirname), ".cache");

type Options =
  | Record<string, never>
  | {
      useFileSystem?: boolean;
    };

export function createCache<T>({ useFileSystem }: Options = {}) {
  const memCache = new Map<string, T>();
  let fileSystemPath = "";

  if (useFileSystem) {
    fileSystemPath = CACHE_PATH;
    fs.mkdirpSync(fileSystemPath);
  }

  return {
    delete: (rawKey: string): void => {
      const key = makeCacheKey(rawKey);
      memCache.delete(key);

      if (useFileSystem) {
        fs.unlink(path.join(fileSystemPath, key));
      }
    },
    set: (rawKey: string, value: T): void => {
      const key = makeCacheKey(rawKey);
      memCache.set(key, value);

      if (useFileSystem) {
        try {
          fs.writeFileSync(
            path.join(fileSystemPath, key),
            JSON.stringify(value),
            {
              encoding: "utf-8",
            }
          );
        } catch (err) {
          /* no-op */
        }
      }
    },
    get: (rawKey: string): T | undefined => {
      const key = makeCacheKey(rawKey);
      const cachedVal = memCache.get(key);

      if (cachedVal) {
        return cachedVal;
      } else if (useFileSystem) {
        try {
          return JSON.parse(
            fs.readFileSync(path.join(fileSystemPath, key), "utf-8")
          ) as T;
        } catch (err) {
          // Silently fail since the file is not available and thus not cached
          return undefined;
        }
      }
    },
  };
}

function makeCacheKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}
