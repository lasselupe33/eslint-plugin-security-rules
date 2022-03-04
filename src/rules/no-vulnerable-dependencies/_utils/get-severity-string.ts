import chalk from "chalk";

import { AdvisorySeverity } from "./get-package-advisories";

export function getSeverityString(severity: AdvisorySeverity): string {
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
