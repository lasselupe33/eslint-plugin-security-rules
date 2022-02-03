import path from "path";

export const docsRoute = (dirname: string, filename: string) => {
  // const relevantIndex =

  // console.log(dirname.split(path.sep));
  return `https://github.com/lasselupe33/eslint-plugin-security-rules/tree/master/src/rules/${dirname}/${filename}`;
};
