import { TSESTree } from "@typescript-eslint/utils";
import { RuleFix, RuleFixer } from "@typescript-eslint/utils/dist/ts-eslint";
import { JSONProperty } from "jsonc-eslint-parser/lib/parser/ast";

export function upgradeDependency(
  fixer: RuleFixer,
  node: JSONProperty,
  newVersion: string
): RuleFix {
  // @TODO Parse existing semver range properly such that we ensure we match
  // previous operators when overwriting version.
  return fixer.replaceText(
    node.value as unknown as TSESTree.Node,
    `"^${newVersion}"`
  );
}
