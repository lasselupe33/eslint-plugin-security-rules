import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";
import { repeat } from "../../../utils/testing/repeat";

import { MessageIds, noPackageVulnerableDependencies } from "./_rule";

const ruleTester = new ESLintUtils.RuleTester({
  // @ts-expect-error We ARE allowed to use other parsers than
  // @typescript-eslint/parser
  parser: "jsonc-eslint-parser",
});

ruleTester.run(
  "package/no-vulnerable-dependencies",
  noPackageVulnerableDependencies,
  {
    valid: [getCode(__dirname, "safe-deps/package")],
    invalid: [
      {
        ...getCode(__dirname, "unsafe-deps/package"),
        errors: repeat(
          { messageId: MessageIds.FOUND_VULNERABLE_DEPENDENCY },
          3
        ),
      },
    ],
  }
);
