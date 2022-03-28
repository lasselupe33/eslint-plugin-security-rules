import fs from "fs";
import { readFile } from "fs/promises";
import path from "path";

const myPath = path.join(__dirname, "..", "my-path.ts");

fs.readFile(myPath, { encoding: "utf-8" }, () => {
  /* no-op */
});
fs.readFileSync(myPath, "utf-8");
readFile(myPath, "utf-8");

fs.writeFileSync(myPath, "utf-8");
