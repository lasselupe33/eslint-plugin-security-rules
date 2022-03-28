import fs from "fs";
import { readFile } from "fs/promises";
import path from "path";

const unsafe = await (await fetch("evil.site")).text();
const myPath = path.join(__dirname, "..", unsafe);

fs.readFile(myPath, { encoding: "utf-8" }, () => {
  /* no-op */
});
fs.readFileSync(myPath, "utf-8");
readFile(myPath, "utf-8");

fs.writeFileSync(myPath, "utf-8");
