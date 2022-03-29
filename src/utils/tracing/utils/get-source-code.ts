import { readFileSync } from "fs";
import path from "path";

import {
  Linter,
  RuleContext,
  SourceCode,
} from "@typescript-eslint/utils/dist/ts-eslint";
import resolve from "enhanced-resolve";

import { createCache } from "../../cache";
import { Meta } from "../types/context";

export type NewFileSourceCode = {
  sourceCode: SourceCode;
  resolvedPath: string;
  ruleContext: RuleContext<string, readonly unknown[]> | undefined;
};

const resolver = resolve.create.sync({
  extensions: [".ts", ".tsx", ".js", ".jsx", ".node"],
});

const sourceCache = createCache<NewFileSourceCode>();

export function getSourceCodeOfFile(
  currContext: RuleContext<string, readonly unknown[]>,
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

    const sourceCode = loadSourceCode(currContext, filePath, meta.parserPath);

    return sourceCode;
  } catch (err) {
    /* no-op since resolver WILL fail on node.js internals etc. */
  }
}

function loadSourceCode(
  currContext: RuleContext<string, readonly unknown[]>,
  path: string,
  parserPath: string
): NewFileSourceCode {
  const cachedSource = sourceCache.get(path);

  if (cachedSource) {
    return cachedSource;
  }

  const linter = new Linter();
  // eslint-disable-next-line security-rules/node/no-unsafe-path
  const code = readFileSync(path, "utf-8");
  let context: RuleContext<string, readonly unknown[]> | undefined;

  linter.defineRule("context-extractor", {
    meta: {
      type: "problem",
      messages: {},
      schema: {},
    },
    create: (internalContext) => {
      context = internalContext;

      return {};
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  linter.defineParser("parser", require(parserPath));
  linter.verify(
    cachedSource ?? code,
    {
      parser: "parser",
      parserOptions: currContext.parserOptions,
      rules: {
        "context-extractor": ["error"],
      },
    },
    { filename: path }
  );

  const sourceCode = linter.getSourceCode();

  const out = {
    sourceCode,
    ruleContext: context,
    resolvedPath: path,
  };
  sourceCache.set(path, out);

  return out;
}
