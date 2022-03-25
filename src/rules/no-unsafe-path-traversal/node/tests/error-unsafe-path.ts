import fs from "fs";
import { readFile } from "fs/promises";

const unsafe = await (await fetch("evil.site")).text();

fs.readFile(unsafe, { encoding: "utf-8" }, () => {
  /* no-op */
});
fs.readFileSync(unsafe, "utf-8");
readFile(unsafe, "utf-8");

fs.writeFileSync(unsafe, "utf-8");
