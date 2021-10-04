import fs from "fs";
import path from "path";

import { RuleTester } from "eslint";

import { limitSingleLineCommentsRule } from "../../rules/limit-single-line-comments";

const filesRoot = path.join(
  __dirname,
  "..",
  "files",
  "limit-single-line-comments"
);
const ruleTester = new RuleTester();

ruleTester.run("limit-single-line-comments", limitSingleLineCommentsRule, {
  valid: [
    {
      code: fs.readFileSync(
        require.resolve(path.join(filesRoot, "ok")),
        "utf8"
      ),
    },
  ],

  invalid: [
    // {
    //   code: fs.readFileSync(
    //     require.resolve(path.join(filesRoot, "too-long")),
    //     "utf8"
    //   ),
    //   errors: [{}],
    // },
  ],
});
