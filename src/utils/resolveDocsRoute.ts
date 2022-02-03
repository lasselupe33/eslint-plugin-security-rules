import path from "path";

export const resolveDocsRoute = (dirname: string): string => {
  const directories = dirname.split(path.sep);
  const stripAtIndex = directories.findIndex((it) => it === "rules");

  if (stripAtIndex === -1) {
    throw new Error(
      `docsRoute(): Unable to resolve route to documents - dirname: ${dirname}`
    );
  }

  const pathToRule = directories.slice(stripAtIndex + 1).join(path.sep);

  return `https://github.com/lasselupe33/eslint-plugin-security-rules/tree/master/src/rules/${pathToRule}/_docs.md`;
};
