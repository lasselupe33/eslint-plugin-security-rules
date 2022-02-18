import { TSESTree } from "@typescript-eslint/utils";

/**
 * Simple utility to determine if a range occurs before or after another in the
 * source code. We return a number to more simply conform to JS sorting methods.
 */
export function isRangeAfter(a: TSESTree.Range, b: TSESTree.Range): number {
  return a[0] - b[1];
}
