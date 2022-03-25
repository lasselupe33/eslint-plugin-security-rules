import fs from "fs";

import { sanitizePath } from "../../../../utils/sanitize-path";

const unsafe = await (await fetch("evil.site")).text();

const safe = sanitizePath(__dirname, "@test-root", unsafe);

const modified = `../../${safe}`;

fs.readFile(modified, { encoding: "utf-8" }, () => {
  /* no-op */
});
