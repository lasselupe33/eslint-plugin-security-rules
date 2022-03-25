import { readFileSync } from "fs";
import path from "path";

import { Linter, SourceCode } from "@typescript-eslint/utils/dist/ts-eslint";
import resolve from "enhanced-resolve";

import { createCache } from "../../cache";
import { sanitizePath } from "../../sanitize-path";
import { Meta } from "../types/context";

export type NewFileSourceCode = {
  sourceCode: SourceCode;
  resolvedPath: string;
};

const resolver = resolve.create.sync({
  extensions: [".ts", ".tsx", ".js", ".jsx", ".node"],
});

const sourceCache = createCache<SourceCode>();

export function getSourceCodeOfFile(
  meta: Meta,
  filename: string
): NewFileSourceCode | undefined {
  const baseDir = path.dirname(meta.filePath);

  if (baseDir === "<input>") {
    console.warn(
      "Multi-file parsing is not supported when piping input into ESLint"
    );
    return;
  }

  try {
    const filePath = resolver(baseDir, filename);

    if (!filePath || filePath.includes("node_modules")) {
      return;
    }

    const sourceCode = loadSourceCode(filePath, meta.parserPath);

    return { sourceCode, resolvedPath: filePath };
  } catch (err) {
    /* no-op since resolver WILL fail on node.js internals etc. */
  }
}

function loadSourceCode(path: string, parserPath: string): SourceCode {
  const cachedSource = sourceCache.get(path);

  if (cachedSource) {
    return cachedSource;
  }

  const linter = new Linter();
  const code = readFileSync(
    sanitizePath(__dirname, "../../../../", path),
    "utf-8"
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  linter.defineParser("parser", require(parserPath));

  linter.verify(
    cachedSource ?? code,
    {
      parser: "parser",
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
      },
    },
    { filename: path }
  );

  const sourceCode = linter.getSourceCode();
  sourceCache.set(path, sourceCode);

  return sourceCode;
}
