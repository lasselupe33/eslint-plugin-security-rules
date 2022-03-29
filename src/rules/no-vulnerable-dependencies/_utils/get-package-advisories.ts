import { minVersion } from "semver";

import { createCache } from "../../../utils/cache";
import { syncFetch } from "../../../utils/sync-fetch/fetch";

import { Package, PackageLocationMeta } from "./find-relevant-packages";

const BULK_ADVISORY_API =
  "https://registry.npmjs.org/-/npm/v1/security/advisories/bulk";

export type AdvisorySeverity = "low" | "moderate" | "high" | "critical";

export type Advisory = {
  id: number;
  url: string;
  title: string;
  severity: AdvisorySeverity;
  vulnerable_versions: string;
};

type BulkAdvisoryRequest = Record<string, string[]>;
export type BulkAdvisoryResponse = Record<string, Advisory[]>;

const CACHE_TTL = 1000 * 60 * 60 * 2; // 2 Hours

const advisoryCache = createCache<{
  advisories: BulkAdvisoryResponse;
  packageModifiedAt: number;
  fetchedAt: number;
}>({ useFileSystem: true });

/**
 * Cached method that returns the advisories related to a given package
 */
export function getPackageAdvisories({
  pkg,
  paths,
}: PackageLocationMeta): BulkAdvisoryResponse | undefined {
  const packagePath = paths[0];

  if (!packagePath) {
    return undefined;
  }

  const cacheEntry = advisoryCache.get(packagePath.path);

  // In case we have a cache entry that is still up to date with the current
  // package, then we can simply return our cached result.
  if (
    cacheEntry?.packageModifiedAt &&
    cacheEntry.packageModifiedAt === packagePath.modifiedAt &&
    cacheEntry.fetchedAt + CACHE_TTL > Date.now()
  ) {
    return cacheEntry.advisories;
  }

  const response = fetchPackageAdvisories(pkg);

  if (response !== undefined) {
    advisoryCache.set(packagePath.path, {
      advisories: response,
      packageModifiedAt: packagePath.modifiedAt,
      fetchedAt: Date.now(),
    });
  }

  return response;
}

/**
 * Sync request that fetches advisories based on all the dependencies present
 * in the provided package.
 */
export function fetchPackageAdvisories(
  pkg: Package
): BulkAdvisoryResponse | undefined {
  try {
    return syncFetch<BulkAdvisoryResponse>(BULK_ADVISORY_API, {
      method: "POST",
      headers: {
        ["content-type"]: "application/json",
      },
      data: convertDependenciesToBulkRequest(pkg),
      timeout: 5_000,
    });
  } catch (err) {
    console.warn(err);

    return undefined;
  }
}

function convertDependenciesToBulkRequest(pkg: Package): BulkAdvisoryRequest {
  const packages = { ...pkg.dependencies, ...pkg.devDependencies };
  const request: BulkAdvisoryRequest = {};

  for (const [name, value] of Object.entries(packages)) {
    // We use the lowest compatible version that the package allows, assuming
    // 'worst' case scenarios.
    try {
      const semver = minVersion(value);

      if (!semver) {
        continue;
      }

      request[name] = [semver.version];
    } catch (err) {
      continue;
    }
  }

  return request;
}
