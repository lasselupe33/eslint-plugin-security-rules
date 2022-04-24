import { execSync } from "child_process";
import path from "path";

import fs from "fs-extra";

import { sanitizePath } from "../src/utils/sanitize-path";

export async function entrypoint(
  iterations: number,
  files: string
): Promise<void> {
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
    heapUsageMb: {
      withRules: {
        runsMs: [] as number[],
        avgMs: 0,
      },
      withoutRules: {
        runsMs: [] as number[],
        avgMs: 0,
      },
    },
    meta: {
      target: files,
      linesOfCode: {
        files: Number(jsLoC?.[1]),
        blank: Number(jsLoC?.[2]),
        comment: Number(jsLoC?.[3]),
        code: Number(jsLoC?.[4]),
      },
    },
  };

  const outDir = path.join(__dirname, "results", "memory", `${jsLoC?.[4]}`);
  fs.mkdirpSync(outDir);

  for (let i = 0; i < iterations; i++) {
    const res = JSON.parse(
      execSync(`ts-node ${path.join(__dirname, "memory.ts")} ${files}`, {
        encoding: "utf8",
      })
    );

    stats.heapUsageMb.withRules.runsMs.push(res.withRules);
    stats.heapUsageMb.withoutRules.runsMs.push(res.withoutRules);
    console.log(i);
  }

  stats.heapUsageMb.withRules.avgMs =
    stats.heapUsageMb.withRules.runsMs.reduce((acc, curr) => acc + curr, 0) /
    stats.heapUsageMb.withRules.runsMs.length;

  stats.heapUsageMb.withoutRules.avgMs =
    stats.heapUsageMb.withoutRules.runsMs.reduce((acc, curr) => acc + curr, 0) /
    stats.heapUsageMb.withoutRules.runsMs.length;

  fs.writeFileSync(
    sanitizePath(
      __dirname,
      process.cwd(),
      path.join(
        outDir,
        `${new Date().toISOString().replace(/[:.]/g, "-")}.json`
      )
    ),
    JSON.stringify(stats, undefined, 2),
    { encoding: "utf-8" }
  );
}

entrypoint(Number(process.argv[2]), process.argv[3] as unknown as string);
