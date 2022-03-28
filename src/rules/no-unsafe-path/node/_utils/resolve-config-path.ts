import path from "path";

/**
 * The path where the sanitation method/root for this rule is located can be
 * configured in a variety of different ways.
 *
 * Firstly we may need to resolve it relative to the root of the current
 * working directory ({{root}}), based on an absolute path ({{abs}}:) or it
 * should point to the current file ({{inplace}})
 */
export function resolveConfigPath(
  configPath:
    | "{{root}}"
    | `{{root}}/${string}`
    | "{{inplace}}"
    | `{{abs}}:${string}`,
  dirname: string,
  cwd: string
): undefined | string {
  if (configPath === "{{inplace}}") {
    return;
  } else if (configPath.startsWith("{{root}}")) {
    const targetSegments = configPath.replace("{{root}}", cwd).split(path.sep);
    const sourceSegments = dirname.split(path.sep);

    const greatestMatchIndex =
      sourceSegments.findIndex((it, index) => it !== targetSegments[index]) - 1;

    const backtrack = `..${path.sep}`.repeat(
      Math.max(0, sourceSegments.length - 1 - greatestMatchIndex)
    );

    return path.join(
      backtrack,
      ...targetSegments.slice(greatestMatchIndex + 1)
    );
  } else if (configPath.startsWith("{{abs}}")) {
    return configPath.replace("{{abs}}:", "");
  }

  return configPath;
}
