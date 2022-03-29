import { TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";
import chalk from "chalk";

import { isLiteral } from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { getAdvisories } from "../_utils/get-dependency-advisories";
import { getSeverityString } from "../_utils/get-severity-string";

/**
 * Progress
 *  [X] Detection
 *  [/] Automatic fix / Suggestions
 *  [X] Reduction of false positives
 *  [X] Fulfilling unit testing
 *  [X] Extensive documentation
 *  [/] Fulfilling configuration options
 */

export enum MessageIds {
  FOUND_VULNERABLE_DEPENDENCY = "found-vulnerable-dependency",
}

const createRule = RuleCreator(resolveDocsRoute);

/**
 * Scans import statements to determine if any of the installed dependencies
 * exist in a vulnerable version.
 *
 * The intent of this is to allow developers to
 * act quickly once vulnerable dependencies are identified.
 */
export const noUniversalVulnerableDependencies = createRule<[], MessageIds>({
  name: "no-vulnerable-dependencies/universal",
  defaultOptions: [],
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      [MessageIds.FOUND_VULNERABLE_DEPENDENCY]: `{{ severity }} {{ id }} {{ title }} ({{ vulnerable_versions }})`,
    },
    docs: {
      description:
        "Determines if import statements exist in a vulnerable version",
      recommended: "error",
    },
    hasSuggestions: false,
    schema: {},
  },
  create: (context) => {
    const dependenciesInFile = new Set<string>();
    const depToNode = new Map<string, TSESTree.Node[]>();

    return {
      "ImportExpression, ImportDeclaration": (
        node: TSESTree.ImportDeclaration | TSESTree.ImportExpression
      ) => {
        if (!isLiteral(node.source)) {
          return;
        }

        const depName = String(node.source.value);

        dependenciesInFile.add(depName);
        depToNode.set(depName, [...(depToNode.get(depName) ?? []), node]);
      },
      "CallExpression[callee.name='require']": (
        node: TSESTree.CallExpression
      ) => {
        const importSource = node.arguments[0];

        if (!isLiteral(importSource)) {
          return;
        }

        const depName = String(importSource.value);

        dependenciesInFile.add(depName);
        depToNode.set(depName, [...(depToNode.get(depName) ?? []), node]);
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
            const nodes = depToNode.get(dependency);

            if (!nodes) {
              continue;
            }

            for (const node of nodes) {
              for (const advisory of advisoriesForDep.advisories) {
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
                });
              }
            }
          }
        }
      },
    };
  },
});
