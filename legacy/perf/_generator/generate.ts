import path from "path";

import fs from "fs-extra";

const templatesDir = path.join(__dirname, "templates");

async function generateChain(
  amountOfIntermediateFiles: number,
  large: boolean
): Promise<void> {
  const outDir = path.join(
    __dirname,
    "..",
    `generated-${large ? "large-" : ""}${amountOfIntermediateFiles}`
  );
  await fs.ensureDir(outDir);
  await fs.emptyDir(outDir);

  const entrypoint = await fs.readFile(
    require.resolve(path.join(templatesDir, "entrypoint.tmpl")),
    "utf-8"
  );
  const intermediate = await fs.readFile(
    require.resolve(
      path.join(templatesDir, `intermediate${large ? ".large" : ""}.tmpl`)
    ),
    "utf-8"
  );
  const source = await fs.readFile(
    require.resolve(path.join(templatesDir, "source.tmpl")),
    "utf-8"
  );

  // Entrypoint
  await fs.writeFile(
    path.join(outDir, "entrypoint.ts"),
    entrypoint
      .replaceAll("[[nextIndex]]", "0")
      .replaceAll("[[nextFile]]", "./intermediate-0")
  );

  // All intermediates - 1
  for (let i = 0; i < amountOfIntermediateFiles - 1; i++) {
    await fs.writeFile(
      path.join(outDir, `intermediate-${i}.ts`),
      intermediate
        .replaceAll("[[index]]", `${i}`)
        .replaceAll("[[nextIndex]]", `${i + 1}`)
        .replaceAll("[[nextFile]]", `./intermediate-${i + 1}`)
    );
  }

  // Final intermediate
  await fs.writeFile(
    path.join(outDir, `intermediate-${amountOfIntermediateFiles - 1}.ts`),
    intermediate
      .replaceAll("[[index]]", `${amountOfIntermediateFiles - 1}`)
      .replaceAll("[[nextIndex]]", `${amountOfIntermediateFiles}`)
      .replaceAll("[[nextFile]]", `./source`)
  );

  // Source
  await fs.writeFile(
    path.join(outDir, "source.ts"),
    source.replaceAll("[[index]]", `${amountOfIntermediateFiles}`)
  );
}

generateChain(
  process.argv[2] as unknown as number,
  process.argv[3] === "true"
).finally(() => console.log("Finished"));
