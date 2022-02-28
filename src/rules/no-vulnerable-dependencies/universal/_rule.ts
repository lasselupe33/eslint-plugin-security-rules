import { TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";
import { coerce, diff, gt, SemVer } from "semver";

import { isLiteral } from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { getAdvisories } from "../_utils/get-dependency-advisories";
import { AdvisorySeverity } from "../_utils/get-package-advisories";

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
  FOUND_VULNERABLE_DEPENDENCY = "found-vulnerable-dependency",
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
      [MessageIds.FOUND_VULNERABLE_DEPENDENCY]:
        "[{{ severity }}/{{ patch }}] Please upgrade '{{ dependency }}' to at least to version {{ minVersion }}, currently on {{ currentVersion }}",
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
    const dependenciesInFile = new Set<string>();
    const depToNode = new Map<string, TSESTree.Node>();

    return {
      "ImportExpression, ImportDeclaration": (
        node: TSESTree.ImportDeclaration | TSESTree.ImportExpression
      ) => {
        if (!isLiteral(node.source)) {
          return;
        }

        dependenciesInFile.add(String(node.source.value));
        depToNode.set(String(node.source.value), node);
      },
      "CallExpression[callee.name='require']": (
        node: TSESTree.CallExpression
      ) => {
        const importSource = node.arguments[0];

        if (!isLiteral(importSource)) {
          return;
        }

        dependenciesInFile.add(String(importSource.value));
        depToNode.set(String(importSource.value), node);
      },
      "Program:exit": () => {
        if (dependenciesInFile.size === 0) {
          return;
        }

        const advisories = getAdvisories(
          context.getPhysicalFilename?.() ?? context.getFilename(),
          dependenciesInFile
        );

        for (const dependency of dependenciesInFile) {
          const advisoriesForDep = advisories.get(dependency);

          // In case there exists an advisory for the current dependency, then
          // we need to flag it!
          if (advisoriesForDep) {
            const node = depToNode.get(dependency);

            if (!node) {
              continue;
            }

            const currentVersion = coerce(
              {
                ...advisoriesForDep.relatedPackage.devDependencies,
                ...advisoriesForDep.relatedPackage.dependencies,
              }[dependency]
            );

            let minFixedVersion: SemVer | null = null;
            let maxSeverity: AdvisorySeverity = "low";

            // For simplicity sake, and to not overwhelm developers, we simply
            // concatenate all found advisories into a single report, urging
            // developers to upgrade to at least the lowest version that fixes
            // the problem.
            for (const advisory of advisoriesForDep.advisories) {
              const advisoryFixedAt = coerce(
                advisory.vulnerable_versions.split("<")[1]
              );

              if (
                !minFixedVersion ||
                (advisoryFixedAt && gt(advisoryFixedAt, minFixedVersion))
              ) {
                minFixedVersion = advisoryFixedAt;
                maxSeverity = getMaxSeverity(maxSeverity, advisory.severity);
              }
            }

            context.report({
              node,
              messageId: MessageIds.FOUND_VULNERABLE_DEPENDENCY,
              data: {
                severity: maxSeverity,
                minVersion: minFixedVersion?.version,
                currentVersion,
                dependency,
                patch: diff(minFixedVersion ?? "", currentVersion ?? ""),
              },
            });
          }
        }
      },
    };
  },
});

function getMaxSeverity(
  a: AdvisorySeverity,
  b: AdvisorySeverity
): AdvisorySeverity {
  if (a === "critical" || b === "critical") {
    return "critical";
  } else if (a === "high" || b === "high") {
    return "high";
  } else if (a === "moderate" || b === "moderate") {
    return "moderate";
  } else {
    return "low";
  }
}
