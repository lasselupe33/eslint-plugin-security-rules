import path from "path";

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
