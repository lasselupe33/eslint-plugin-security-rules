import path from "path";

import sanitizeFilename from "sanitize-filename";

/**
 * Sanitizes a path-string to ensure that it does not exceed the supplied root
 * folder while also ensuring that it does not contain malicious patterns using
 * the package 'sanitize-filename'.
 */
export function sanitizePath(
  baseDir: string,
  relativeOrAbsoluteRootDir: string,
  relativeOrAbsolutePath: string
) {
  const rootDir = path.isAbsolute(relativeOrAbsoluteRootDir)
    ? relativeOrAbsoluteRootDir
    : path.join(baseDir, relativeOrAbsoluteRootDir);
  const absolutePath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(baseDir, relativeOrAbsolutePath);

  if (absolutePath.indexOf(rootDir) !== 0) {
    throw new Error("Invalid attempt to traverse outside of rootDir");
  }

  // sanitize-filename does not allow any form of folder traversal, however this
  // may not be sufficient for all use cases.
  // Thus we add a custom replacement method that ensures valid path traversal
  // is maintained.
  const tempSep = "__sep__";
  return sanitizeFilename(absolutePath, {
    replacement: (toReplace) => {
      if (toReplace === path.sep) {
        return tempSep;
      }

      return "";
    },
  }).replace(/__sep__/g, path.sep);
}
