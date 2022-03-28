import fs from "fs";

import { sanitizePath } from "../../../../../utils/sanitize-path";

const unsafe = await (await fetch("evil.site")).text();

fs.readFileSync(sanitizePath(__dirname, "@test-root", unsafe), "utf-8");
