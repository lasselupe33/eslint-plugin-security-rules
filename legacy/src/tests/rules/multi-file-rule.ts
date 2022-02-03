import fs from "fs";
import path from "path";

import { RuleTester } from "eslint";

import { multiFileRule } from "../../rules/multi-file-rule";

const filesRoot = path.join(__dirname, "..", "files", "multi-file-rule");

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
});

ruleTester.run("multi-file-rule", multiFileRule, {
  valid: [
    {
      code: fs.readFileSync(
        require.resolve(path.join(filesRoot, "entry")),
        "utf8"
      ),
    },
  ],

  invalid: [
    // {
    //   code: fs.readFileSync(
    // require.resolve(path.join(filesRoot, "too-long")),
    // "utf8"
    //   ),
    //   errors: [{}],
    // },
  ],
});
