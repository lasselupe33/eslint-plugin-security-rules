import { execSync } from "child_process";
import path from "path";

import type { Linter } from "eslint";

import { createCache } from "./cache";

const parserLocationCache = createCache<string>({
  useFileSystem: true,
  scope: "load_parser",
});
const parserCache = createCache<Linter.ParserModule>();

export function loadParser(absoluteFilename: string) {
  const ext = path.extname(absoluteFilename);
  const cached = parserCache.get(ext);

  if (cached) {
    return cached;
  }

  try {
    let parserLocation = parserLocationCache.get(ext);

    if (!parserLocation) {
      const config = JSON.parse(
        execSync(`npx eslint --print-config ${absoluteFilename}`).toString(
          "utf-8"
        )
      );

      parserLocation = config.parser as string;
      parserLocationCache.set(ext, parserLocation);
    }

    // We must require the parser synchronously given that Promises are not
    // supported inside rules.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const parser = require(parserLocation) as Linter.ParserModule;

    parserCache.set(ext, parser);
    return parser;
  } catch (err) {
    console.error("loadParser(): failed to load config", err);
  }
}
