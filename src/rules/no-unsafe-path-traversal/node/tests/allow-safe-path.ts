import fs from "fs";
import { readFile } from "fs/promises";

fs.readFile("my-path.ts", { encoding: "utf-8" }, () => {
  /* no-op */
});
fs.readFileSync("my-path.ts", "utf-8");
readFile("my-path.ts", "utf-8");

fs.writeFileSync("my-path.ts", "utf-8");
