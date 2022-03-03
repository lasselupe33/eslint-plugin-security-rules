import { RuleFix, RuleFixer } from "@typescript-eslint/utils/dist/ts-eslint";

export function upgradeDependency(
  fixer: RuleFixer,
  pkgPath: string,
  depdencyName: string,
  newVersion: string
): RuleFix {
  // @TODO: Wait for eslint to support side effects in suggestions, then
  // uncomment this code.
  // try {
  //   const pkg: Package = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  //   // @TODO: properly parse existing semver range and preserve its format
  //   // (while still guaranteeing that the new range will be at least the
  //   // newVersion).
  //   if (pkg.dependencies?.[depdencyName]) {
  //     pkg.dependencies[depdencyName] = `~${newVersion}`;
  //   } else if (pkg.devDependencies?.[depdencyName]) {
  //     pkg.devDependencies[depdencyName] = `~${newVersion}`;
  //   }

  //   // @TODO: parse indentation of existing package to respect its structure
  //   // when updating it.
  //   //
  //   // Perhaps we should just use regex's to find and insert
  //   // into existing format, avoiding JSON.parsing/stringifying?
  //   // fs.writeFileSync(pkgPath, JSON.stringify(pkg, undefined, 2));
  //   console.log(pkg);
  // } catch (err) {
  //   console.error(err);
  // }

  // Make eslint happy about the fix, but perform no actual modifications on
  // the source file. (We have changed the package.json instead)
  return fixer.insertTextAfterRange([0, 0], "");
}
