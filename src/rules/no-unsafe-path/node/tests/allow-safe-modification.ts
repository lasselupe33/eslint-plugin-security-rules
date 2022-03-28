import fs from "fs";

const safe = "safepath";

const modified = `../../${safe}/some-path`;

fs.readFile(modified, { encoding: "utf-8" }, () => {
  /* no-op */
});
