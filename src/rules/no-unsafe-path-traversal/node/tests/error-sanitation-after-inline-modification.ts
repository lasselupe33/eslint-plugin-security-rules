import fs from "fs";

import { sanitizePath } from "../../../../utils/sanitize-path";

const unsafe = await (await fetch("evil.site")).text();

const modified = `../../${sanitizePath(__dirname, "@test-root", unsafe)}`;

fs.readFile(modified, { encoding: "utf-8" }, () => {
  /* no-op */
});
