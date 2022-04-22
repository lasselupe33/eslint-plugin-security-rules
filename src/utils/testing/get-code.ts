import fs from "fs";

import resolve from "enhanced-resolve";

import { sanitizePath } from "../sanitize-path";

const resolver = resolve.create.sync({
  extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
});

export function getCode(dirname: string, name: string) {
  const resolvedPath = resolver(dirname, `./tests/${name}`);

  if (!resolvedPath) {
    throw new Error("getCode(): Unable to resolve path");
  }

  return {
    code: fs.readFileSync(
      sanitizePath(__dirname, process.cwd(), resolvedPath),
      "utf-8"
    ),
    filename: resolvedPath,
    name,
  };
}
