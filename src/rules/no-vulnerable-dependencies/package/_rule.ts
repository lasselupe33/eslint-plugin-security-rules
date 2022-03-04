import { TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";
import chalk from "chalk";
import { coerce, diff } from "semver";

import { isLiteral } from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { upgradeDependency } from "../_utils/fixes/upgrade-dependency";
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
  UPGRADE_PACKAGE_FIX = "upgrade-package-fix",
}

const createRule = RuleCreator(resolveDocsRoute);

/**
 * INTRODUCTION.
 */
export const noPackageVulnerableDependencies = createRule<[], MessageIds>({
  name: "no-vuln-deps/package",
  defaultOptions: [],
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      [MessageIds.FOUND_VULNERABLE_DEPENDENCY]: `{{ severity }} {{ id }} {{ title }} ({{ vulnerable_versions }})`,
      [MessageIds.UPGRADE_PACKAGE_FIX]:
        "[{{ patch }} patch] Upgrade '{{ dependency }}' to version {{ minVersion }} from {{ currentVersion }}. Please re-install packages afterwards",
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

            for (const advisory of advisoriesForDep.advisories) {
              const advisoryFixedAt = coerce(
                advisory.vulnerable_versions.split("<")[1]
              );

              const idArr = advisory.url.split("/");

              context.report({
                node,
                messageId: MessageIds.FOUND_VULNERABLE_DEPENDENCY,
                data: {
                  id: chalk.dim(`[${idArr[idArr.length - 1]}]`),
                  severity: getSeverityString(advisory.severity),
                  title: advisory.title,
                  url: advisory.url,
                  vulnerable_versions: advisory.vulnerable_versions,
                },
                suggest: [
                  {
                    messageId: MessageIds.UPGRADE_PACKAGE_FIX,
                    data: {
                      minVersion: advisoryFixedAt?.version,
                      currentVersion,
                      dependency,
                      patch: diff(advisoryFixedAt ?? "", currentVersion ?? ""),
                    },
                    fix: (fixer) =>
                      upgradeDependency(
                        fixer,
                        advisoriesForDep.packagePath,
                        dependency,
                        advisoryFixedAt?.version ?? ""
                      ),
                  },
                ],
              });
            }
          }
        }
      },
    };
  },
});

function getSeverityString(severity: AdvisorySeverity): string {
  switch (severity) {
    case "critical":
      return chalk.magenta(severity);

    case "high":
      return chalk.red(severity);

    case "moderate":
      return chalk.yellow(severity);

    case "low":
      return chalk.green(severity);
  }
}
