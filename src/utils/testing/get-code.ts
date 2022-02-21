import fs from "fs";
import path from "path";

export function getCode(dirname: string, name: string): string {
  return fs.readFileSync(
    require.resolve(path.join(dirname, "tests", name)),
    "utf-8"
  );
}
