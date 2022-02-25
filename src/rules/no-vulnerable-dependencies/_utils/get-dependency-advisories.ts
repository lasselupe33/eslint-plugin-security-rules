import { getRequiredPackages } from "./find-relevant-packages";
import { Advisory, getPackageAdvisories } from "./get-package-advisories";

export function getAdvisories(
  filePath: string,
  dependencies: Set<string>
): Map<string, Advisory[]> {
  const relevantPackages = getRequiredPackages(filePath, dependencies);

  const allAdvisories: {
    path: string;
    advisories: Record<string, Advisory[]>;
  }[] = [];

  for (const pkg of relevantPackages) {
    const pkgPath = pkg.paths[0];

    const advisories = getPackageAdvisories(pkg);

    if (!advisories || !pkgPath) {
      continue;
    }

    allAdvisories.push({ advisories, path: pkgPath.path });
  }

  // Sort our advisories in order such that the most prioritsed package comes
  // first.
  allAdvisories.sort((a, b) => b.path.length - a.path.length);
  const output = new Map<string, Advisory[]>();

  for (const dep of dependencies) {
    for (const bulkAdvisory of allAdvisories) {
      const advisory = bulkAdvisory.advisories[dep];

      if (advisory) {
        output.set(dep, advisory);
        continue;
      }
    }
  }

  return output;
}
