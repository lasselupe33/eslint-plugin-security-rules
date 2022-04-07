import { getRequiredPackages, Package } from "./find-relevant-packages";
import { Advisory, getPackageAdvisories } from "./get-package-advisories";

type Report = {
  packagePath: string;
  relatedPackage: Package;
  advisories: Advisory[];
};

/**
 * Gets relevant advisories from the external Github Advisory Database.
 */
export function getAdvisories(
  filePath: string,
  dependencies: Set<string>
): Map<string, Report> {
  const relevantPackages = getRequiredPackages(filePath, dependencies);

  const allAdvisories: Array<{
    path: string;
    pkg: Package;
    advisories: Record<string, Advisory[]>;
  }> = [];

  for (const pkg of relevantPackages) {
    const pkgPath = pkg.paths[0];

    const advisories = getPackageAdvisories(pkg);

    if (!advisories || !pkgPath) {
      continue;
    }

    allAdvisories.push({ advisories, pkg: pkg.pkg, path: pkgPath.path });
  }

  // Sort our advisories in order such that the nearest package.json
  // comes first.
  allAdvisories.sort((a, b) => b.path.length - a.path.length);

  const output = new Map<string, Report>();

  for (const dep of dependencies) {
    for (const bulkAdvisory of allAdvisories) {
      const advisories = bulkAdvisory.advisories[dep];

      if (advisories) {
        output.set(dep, {
          packagePath: bulkAdvisory.path,
          relatedPackage: bulkAdvisory.pkg,
          advisories,
        });
        continue;
      }
    }
  }

  return output;
}
