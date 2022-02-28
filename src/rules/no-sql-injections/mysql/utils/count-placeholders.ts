import { TSESTree } from "@typescript-eslint/utils";

import { isTemplateElement } from "../../../../utils/ast/guards";

// Counts the number of placeholder signs up to the index given
export function countPlaceholders(
  templateLiteralArray: [
    TSESTree.Expression | TSESTree.TemplateElement,
    boolean | undefined
  ][],
  indexCount: number
): number {
  let count = 0;
  for (const [node, isEscaped] of templateLiteralArray) {
    if (count >= indexCount || !isTemplateElement(node)) {
      continue;
    }
    // Match on ? or ??
    const regex = /(?<!\?)\?\?(?!\?) | (?<!\?)\?(?!\?)/g;
    count += node.value.cooked.match(regex)?.length ?? 0;
  }
  return count;
}
