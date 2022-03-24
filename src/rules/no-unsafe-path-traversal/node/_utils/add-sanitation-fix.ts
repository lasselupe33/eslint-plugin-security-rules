import fs from "fs";
import path from "path";

import { TSESTree } from "@typescript-eslint/utils";
import {
  RuleContext,
  RuleFix,
  RuleFixer,
} from "@typescript-eslint/utils/dist/ts-eslint";

import { getFinalRange } from "../../../../utils/ast/get-final-node";
import { hasImportDeclaration } from "../../../../utils/ast/has-import-declaration";
import { createImportFix } from "../../../../utils/create-import-fix";
import { getModuleScope } from "../../../../utils/get-module-scope";
import { getTypeProgram } from "../../../../utils/types/get-type-program";
import { Config } from "../_rule";

import { resolveConfigPath } from "./resolve-config-path";

export function* addSanitationFix(
  config: Config,
  ctx: RuleContext<string, unknown[]>,
  cwd: string,
  fixer: RuleFixer,
  unsafeNode: TSESTree.Node
): Generator<RuleFix> {
  const importPath = resolveConfigPath(
    config.sanitation.filename,
    path.dirname(ctx.getPhysicalFilename?.() ?? ctx.getFilename()),
    cwd
  );

  if (!importPath) {
    const finalRange = getFinalRange(ctx.getSourceCode());

    if (finalRange) {
      if (
        !hasImportDeclaration(getModuleScope(ctx.getScope()), "path", "path")
      ) {
        yield createImportFix(fixer, "path", "path", { asDefault: true });
      }

      if (
        !hasImportDeclaration(
          getModuleScope(ctx.getScope()),
          "sanitize-filename",
          "sanitizeFilename"
        )
      ) {
        yield createImportFix(fixer, "sanitize-filename", "sanitizeFilename", {
          asDefault: true,
        });
      }

      yield fixer.insertTextAfterRange(
        finalRange,
        `\n\n${getImplementationTemplate(config, ctx)}`
      );
    }
  } else {
    if (
      !hasImportDeclaration(
        getModuleScope(ctx.getScope()),
        importPath,
        config.sanitation.method
      )
    ) {
      yield createImportFix(fixer, importPath, config.sanitation.method, {
        asDefault: config.sanitation.defaultExport ?? false,
      });
    }
  }

  yield fixer.insertTextBefore(
    unsafeNode,
    `${config.sanitation.method}({
  baseDir: __dirname, 
  relativeOrAbsoluteRootDir: "${resolveConfigPath(
    config.root,
    path.dirname(ctx.getPhysicalFilename?.() ?? ctx.getFilename()),
    cwd
  )}",
}, `
  );
  yield fixer.insertTextAfter(unsafeNode, `)`);
}

let fixImplementation: string | undefined;

function getImplementationTemplate(
  config: Config,
  context: RuleContext<string, unknown[]>
): string {
  const typeProgram = getTypeProgram(context);
  const ext = !typeProgram ? "js" : "ts";

  if (!fixImplementation) {
    fixImplementation = fs
      .readFileSync(
        path.join(
          __dirname,
          "..",
          "..",
          "..",
          "..",
          "templates",
          `sanitize-path.${ext}.tmpl`
        ),
        "utf-8"
      )
      .replace("{{methodName}}", config.sanitation.method);
  }

  return fixImplementation;
}