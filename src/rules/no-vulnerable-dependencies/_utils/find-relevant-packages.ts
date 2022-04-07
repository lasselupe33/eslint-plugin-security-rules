import fs from "fs";
import path from "path";

import { createCache } from "../../../utils/cache";
import { sanitizePath } from "../../../utils/sanitize-path";

export type Package = {
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
};

export type PackageLocationMeta = {
  paths: { path: string; modifiedAt: number }[];
  pkg: Package;
};

const dependencyToPackageCache = createCache<PackageLocationMeta>();

/**
 * Cached function that returns all the package.jsons that needs to be
 * inspected to be able to reason about all the dependencies listed in the set.
 */
export function getRequiredPackages(
  filePath: string,
  dependencies: Set<string>
): PackageLocationMeta[] {
  const requiredPackages: PackageLocationMeta[] = [];
  let invalidated = false;

  // In case we've already visited the relevant packages for the given
  // dependencies, then we can simply return the cached version.
  for (const dep of dependencies) {
    const cacheEntry = getPackageCacheEntry(dep);

    if (cacheEntry.invalidated) {
      invalidated = true;
      break;
    }

    requiredPackages.push(cacheEntry.entry);
  }

  if (!invalidated) {
    return requiredPackages;
  }

  const relevantPackages = findRelevantPackages(filePath, dependencies);

  for (const [dependency, pkg] of relevantPackages.entries()) {
    dependencyToPackageCache.set(dependency, pkg);
  }

  return Array.from(relevantPackages.values());
}

/**
 * Helper that extracts a cached entry from the cache and determines if its
 * value has been invalidated due to changes on the filesystem.
 */
function getPackageCacheEntry(key: string):
  | {
      invalidated: true;
    }
  | { invalidated: false; entry: PackageLocationMeta } {
  const entry = dependencyToPackageCache.get(key);

  if (!entry) {
    return { invalidated: true };
  }

  for (const { path, modifiedAt } of entry.paths) {
    if (
      fs.statSync(sanitizePath(__dirname, "../../../../", path)).mtimeMs !==
      modifiedAt
    ) {
      return { invalidated: true };
    }
  }

  return { invalidated: false, entry };
}

/**
 * Extracts the nearest package.json file that includes the specified
 * dependency. In case none have been specified, this function simply returns
 * the nearest package.json
 */
export function findRelevantPackages(
  filePath: string,
  dependencies: Set<string>
): Map<string, PackageLocationMeta> {
  const output = new Map<string, PackageLocationMeta>();

  try {
    const remainingDependencies = new Set(dependencies);

    const paths: { path: string; modifiedAt: number }[] = [];
    let packagePath = path.join(path.dirname(filePath), "package.json");
    let pkg: Package | undefined;

    do {
      const sanitizedPath = sanitizePath(
        __dirname,
        "../../../../",
        packagePath
      );

      if (fs.existsSync(sanitizedPath)) {
        paths.unshift({
          path: packagePath,
          modifiedAt: fs.statSync(sanitizedPath).mtimeMs,
        });

        pkg = JSON.parse(fs.readFileSync(sanitizedPath, "utf8"));

        for (const dependency of remainingDependencies) {
          if (
            pkg?.dependencies?.[dependency] ||
            pkg?.devDependencies?.[dependency]
          ) {
            output.set(dependency, {
              paths: [...paths],
              pkg,
            });

            remainingDependencies.delete(dependency);
          }
        }
      }

      packagePath = path.join(
        path.dirname(path.dirname(packagePath)),
        "package.json"
      );
    } while (packagePath !== "/package.json" && remainingDependencies.size > 0);

    return output;
  } catch (err) {
    return output;
  }
}
