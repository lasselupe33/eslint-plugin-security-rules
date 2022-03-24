import path from "path";

import sanitizeFilename from "sanitize-filename";

export function sanitizePath(
  {
    baseDir,
    relativeOrAbsoluteRootDir,
  }: {
    baseDir: string;
    relativeOrAbsoluteRootDir: string;
  },
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
  }).replaceAll(tempSep, path.sep);
}
