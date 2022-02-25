import { TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { isLiteral } from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { getAdvisories } from "../_utils/get-dependency-advisories";

/**
 * Progress
 *  [X] Detection
 *  [ ] Automatic fix / Suggestions
 *  [ ] Reduction of false positives
 *  [ ] Fulfilling unit testing
 *  [ ] Extensive documentation
 *  [ ] Fulfilling configuration options
 */

export enum MessageIds {
  temp = "tmep",
}

const createRule = RuleCreator(resolveDocsRoute);

/**
 * INTRODUCTION.
 */
export const noUniversalVulnerableDependencies = createRule<
  unknown[],
  MessageIds
>({
  name: "no-xss/browser",
  defaultOptions: [
    {
      sanitation: {
        package: "dompurify",
        method: "sanitize",
        usage: "sanitize(<% html %>, { USE_PROFILES: { html: true } })",
      },
    },
  ],
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      [MessageIds.temp]: "[{{ severity }}] {{ title }} ({{ versions }})",
    },
    docs: {
      description: "TODO",
      recommended: "error",
      suggestion: true,
    },
    hasSuggestions: true,
    schema: {},
  },
  create: (context) => {
    const dependencies = new Set<string>();
    const depToNode = new Map<string, TSESTree.Node>();

    return {
      "ImportExpression, ImportDeclaration": (
        node: TSESTree.ImportDeclaration | TSESTree.ImportExpression
      ) => {
        if (!isLiteral(node.source)) {
          return;
        }

        dependencies.add(String(node.source.value));
        depToNode.set(String(node.source.value), node);
      },
      "CallExpression[callee.name='require']": (
        node: TSESTree.CallExpression
      ) => {
        const importSource = node.arguments[0];

        if (!isLiteral(importSource)) {
          return;
        }

        dependencies.add(String(importSource.value));
        depToNode.set(String(importSource.value), node);
      },
      "Program:exit": () => {
        if (dependencies.size === 0) {
          return;
        }

        const advisories = getAdvisories(
          context.getPhysicalFilename?.() ?? context.getFilename(),
          dependencies
        );

        for (const dependency of dependencies) {
          const advisoriesForDep = advisories.get(dependency);

          if (advisoriesForDep) {
            const node = depToNode.get(dependency);

            if (!node) {
              continue;
            }

            for (const advisory of advisoriesForDep) {
              context.report({
                node,
                messageId: MessageIds.temp,
                data: {
                  versions: advisory.vulnerable_versions,
                  title: advisory.title,
                  severity: advisory.severity,
                },
              });
            }
          }
        }
      },
    };
  },
});
