import fs from "fs";

import { TSESTree } from "@typescript-eslint/utils";
import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";
import {
  ReportDescriptor,
  RuleContext,
  RuleFixer,
} from "@typescript-eslint/utils/dist/ts-eslint";
import chalk from "chalk";
import { JSONProperty } from "jsonc-eslint-parser/lib/parser/ast";
import { coerce, diff, gte } from "semver";

import { resolveDocsRoute } from "../../../utils/resolve-docs-route";
import { sanitizePath } from "../../../utils/sanitize-path";
import { Package } from "../_utils/find-relevant-packages";
import {
  BulkAdvisoryResponse,
  getPackageAdvisories,
} from "../_utils/get-package-advisories";
import { getSeverityString } from "../_utils/get-severity-string";

import { upgradeDependency } from "./fixes/upgrade-dependency";

/**
 * Progress
 *  [X] Detection
 *  [X] Automatic fix / Suggestions
 *  [X] Reduction of false positives
 *  [-] Fulfilling unit testing
 *  [X] Extensive documentation
 *  [/] Fulfilling configuration options
 */

export enum MessageIds {
  FOUND_VULNERABLE_DEPENDENCY = "found-vulnerable-dependency",
  UPGRADE_PACKAGE_FIX = "upgrade-package-fix",
}

const createRule = RuleCreator(resolveDocsRoute);

/**
 * Scans package.json files to determine if any of the installed dependencies
 * exist in a vulnerable version.
 */
export const noPackageVulnerableDependencies = createRule<[], MessageIds>({
  name: "no-vulnerable-dependencies/package",
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
      description:
        "Determines if any of the projects installed dependencies exist in a vulnerable version",
      recommended: "error",
      suggestion: true,
    },
    hasSuggestions: true,
    schema: {},
  },
  create: (context) => {
    const pkgPath = context.getPhysicalFilename?.() ?? context.getFilename();

    // Bail out early if we're not linting a package.json!
    if (!pkgPath.includes("package.json")) {
      return {};
    }

    const dependencies = new Map<
      string,
      {
        version: string;
        node: JSONProperty;
      }
    >();

    return {
      JSONProperty: (node: JSONProperty) => {
        if (
          node.key.type !== "JSONLiteral" ||
          !["dependencies", "devDependencies"].includes(
            String(node.key.value)
          ) ||
          node.value.type !== "JSONObjectExpression"
        ) {
          return;
        }

        for (const dependency of node.value.properties) {
          if (
            dependency.key.type !== "JSONLiteral" ||
            dependency.value.type !== "JSONLiteral"
          ) {
            continue;
          }

          dependencies.set(String(dependency.key.value), {
            version: String(dependency.value.value),
            node: dependency,
          });
        }
      },

      "Program:exit": () => {
        if (dependencies.size === 0) {
          return;
        }

        // Parse dependencies into format required to query advisory database
        const pkgPath =
          context.getPhysicalFilename?.() ?? context.getFilename();
        const pkg: Package = {
          dependencies: Object.fromEntries(
            Array.from(dependencies).map(([key, value]) => [key, value.version])
          ),
        };

        const advisories =
          getPackageAdvisories({
            paths: [
              {
                path: context.getPhysicalFilename?.() ?? context.getFilename(),
                modifiedAt: fs.statSync(
                  sanitizePath(__dirname, process.cwd(), pkgPath)
                ).mtimeMs,
              },
            ],
            pkg,
          }) ?? {};

        reportAdvisories(context, advisories, dependencies);
      },
    };
  },
});

function reportAdvisories(
  context: RuleContext<MessageIds, []>,
  advisories: BulkAdvisoryResponse,
  dependencies: Map<
    string,
    {
      version: string;
      node: JSONProperty;
    }
  >
) {
  for (const [dependency, depAdvisories] of Object.entries(advisories)) {
    const dependencyContext = dependencies.get(dependency);

    if (!dependencyContext) {
      continue;
    }

    const { version, node } = dependencyContext;
    const semverVersion = coerce(version);

    // We only wish to report one suggestion, even if a package has multiple
    // vulnerabilities. This suggestion should attempt to fix to the version
    // that ensures no (known) vulnerabilities are present in the packages.
    const highestVulnerableVersion = depAdvisories
      .map(
        (advisory) =>
          coerce(advisory.vulnerable_versions.split("<")[1])?.version
      )
      .filter((it): it is string => !!it)
      .sort((a, b) => b.localeCompare(a))[0];
    let hasSuggestedFix = false;

    for (const advisory of depAdvisories) {
      const advisoryFixedAt = coerce(
        advisory.vulnerable_versions.split("<")[1] ??
          advisory.vulnerable_versions
      );

      // Extracts the GHSA ID from the URL for pretty error
      // reporting.
      const idArr = advisory.url.split("/");

      // In case we're already at a safe version, then there is no need to
      // report the current vulnerability.
      if (gte(semverVersion ?? "", advisoryFixedAt ?? "")) {
        continue;
      }

      const report: ReportDescriptor<MessageIds> = {
        node: node as unknown as TSESTree.Node,
        messageId: MessageIds.FOUND_VULNERABLE_DEPENDENCY,
        data: {
          id: chalk.dim(`[${idArr[idArr.length - 1]}]`),
          severity: getSeverityString(advisory.severity),
          title: advisory.title,
          url: advisory.url,
          vulnerable_versions: advisory.vulnerable_versions,
        },
      };

      if (!hasSuggestedFix && highestVulnerableVersion) {
        // @ts-expect-error We only wish to add the suggestion once, thus
        // we have to add the suggest property dynimcally.
        report.suggest = [
          {
            messageId: MessageIds.UPGRADE_PACKAGE_FIX,
            data: {
              minVersion: highestVulnerableVersion,
              currentVersion: semverVersion,
              dependency,
              patch: diff(advisoryFixedAt ?? "", semverVersion ?? ""),
            },
            fix: (fixer: RuleFixer) =>
              upgradeDependency(fixer, node, highestVulnerableVersion ?? ""),
          },
        ];
        hasSuggestedFix = true;
      }

      context.report(report);
    }
  }
}
