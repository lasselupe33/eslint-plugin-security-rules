import { execSync } from "child_process";
import path from "path";

import fs from "fs-extra";

import { sanitizePath } from "../src/utils/sanitize-path";

type Stats = {
  rules: Record<string, { runsMs: number[]; avgMs: number }>;
};

export async function entrypoint(
  files: string,
  iterations: number
): Promise<void> {
  const eslintConfig = {
    parserOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      ecmaFeatures: {
        globalReturn: true,
        jsx: true,
      },
    },
    env: {
      node: true,
      browser: true,
      es6: true,
    },
    extends: ["plugin:security-rules/recommended"],
    overrides: [
      {
        files: ["*.ts", "*.tsx"],
        parser: "@typescript-eslint/parser",
      },
      {
        files: ["*.json"],
        parser: "jsonc-eslint-parser",
      },
    ],
  };

  const eslintConfigFile = path.join(
    __dirname,
    `config.${new Date().toISOString().replace(/[:.]/, "-")}.json`
  );

  try {
    fs.writeFileSync(eslintConfigFile, JSON.stringify(eslintConfig), {
      encoding: "utf-8",
    });

    const rawLoC = execSync(`cloc $(find ${files})`, { encoding: "utf-8" });
    const jsLoC = rawLoC
      .split("\n")
      ?.filter(
        (it) =>
          it.includes("JavaScript") ||
          it.includes("TypeScript") ||
          it.includes("JSON")
      )
      ?.map((it) => it.split(" ")?.filter((it) => !!it))
      ?.reduce<[string, number, number, number, number]>(
        (acc, curr) => [
          acc[0] + curr[0],
          (acc[1] ?? 0) + Number(curr[1]),
          (acc[2] ?? 0) + Number(curr[2]),
          (acc[3] ?? 0) + Number(curr[3]),
          (acc[4] ?? 0) + Number(curr[4]),
        ],
        ["", 0, 0, 0, 0]
      );

    const stats = {
      rules: {},
      meta: {
        iterations,
        target: files,
        linesOfCode: {
          files: Number(jsLoC?.[1]),
          blank: Number(jsLoC?.[2]),
          comment: Number(jsLoC?.[3]),
          code: Number(jsLoC?.[4]),
        },
      },
    };

    for (let i = 0; i < iterations; i++) {
      const out = runESLint(eslintConfigFile, files);
      addRun(stats, out);
    }

    calculateAverages(stats);

    const outDir = path.join(
      __dirname,
      "results",
      "individual",
      `${jsLoC?.[4]}`
    );
    fs.mkdirpSync(outDir);

    fs.writeFileSync(
      sanitizePath(
        __dirname,
        __dirname,
        path.join(
          outDir,
          `${new Date().toISOString().replace(/[:.]/g, "-")}.json`
        )
      ),
      JSON.stringify(stats, undefined, 2),
      { encoding: "utf-8" }
    );
  } finally {
    fs.unlinkSync(eslintConfigFile);
  }
}

function addRun(stats: Stats, output: string) {
  const lines = output.trim().split("\n");
  const startOfTiming = lines.lastIndexOf("") + 1;

  const formattedResults = lines
    .slice(startOfTiming + 2)
    .map((it) => it.split(/[|\s]/g).filter((it) => !!it));

  for (const result of formattedResults) {
    const ruleName = result[0];

    if (!ruleName) {
      continue;
    }

    if (!stats.rules[ruleName]) {
      stats.rules[ruleName] = { avgMs: 0, runsMs: [] };
    }

    stats.rules[ruleName]?.runsMs.push(Number(result[1]));
  }
}

function calculateAverages(stats: Stats) {
  for (const rule of Object.keys(stats.rules)) {
    if (stats.rules[rule]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      stats.rules[rule]!.avgMs =
        (stats.rules[rule]?.runsMs.reduce((acc, curr) => acc + curr, 0) ?? 0) /
        (stats.rules[rule]?.runsMs.length ?? 1);
    }
  }
}

function runESLint(configFile: string, files: string): string {
  const eslintPath = path.join(
    process.cwd(),
    "node_modules",
    "eslint",
    "bin",
    "eslint.js"
  );

  const command = `TIMING=ALL node ${eslintPath} --no-inline-config --no-cache --no-eslintrc --config ${configFile} --no-error-on-unmatched-pattern "${files}/**/*.{json,js,jsx,ts,tsx}"`;
  try {
    return execSync(command, {
      encoding: "utf-8",
    });
  } catch (err) {
    const typedErr = err as { stdout?: string };

    if (!typedErr.stdout) {
      throw err;
    }

    return typedErr.stdout;
  }
}

entrypoint(
  process.argv[3] as unknown as string,
  process.argv[2] as unknown as number
);
