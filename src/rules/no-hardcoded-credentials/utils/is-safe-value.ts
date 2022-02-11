import { TSESTree } from "@typescript-eslint/utils";

import { isStringLiteral } from "../../../utils/guards";

export function isSafeValue(testCase: TSESTree.Literal): boolean {
  if (isStringLiteral(testCase)) {
    if (testCase.value === "") {
      return true;
    }

    const reg = /^test/;
    return reg.test(testCase.value);
  }
  return false;
}
