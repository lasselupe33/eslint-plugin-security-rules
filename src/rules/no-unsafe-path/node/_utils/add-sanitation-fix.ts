import fs from "fs";
import path from "path";

import { TSESTree } from "@typescript-eslint/utils";
import {
  RuleContext,
  RuleFix,
  RuleFixer,
} from "@typescript-eslint/utils/dist/ts-eslint";

import { getFinalRange } from "../../../../utils/ast/get-final-range";
import { isFunctionDeclaration } from "../../../../utils/ast/guards";
import { createImportStatementFix } from "../../../../utils/ast/import-fix";
import { getTypeProgram } from "../../../../utils/types/get-type-program";
import { Config } from "../_rule";

import { resolveConfigPath } from "./resolve-config-path";

/**
 * This fix wraps the vulnerable path inside a call to the sanitation method.
 *
 * If the fix is configured to place this method in the same file
 * ({{inplace}}), then we must also include the template to the sanitation
 * method in the bottom of the file.
 *
 * If the sanitation method exists in another file ({{root}} or {{abs}}), then
 * we simply add an import to it instead (either relative or absolute depending
 * on configuration.)
 */
export function* addSanitationFix(
  config: Config,
  ctx: RuleContext<string, unknown[]>,
  cwd: string,
  fixer: RuleFixer,
  unsafeNode: TSESTree.Node
): Generator<RuleFix> {
  const importPath = resolveConfigPath(
    config.sanitation.location,
    path.dirname(ctx.getPhysicalFilename?.() ?? ctx.getFilename()),
    cwd
  );

  // In case no import path was available, then it means that the sanitization
  // method should be inserted into the same file (i.e. {{inplace}})
  if (!importPath) {
    const finalRange = getFinalRange(ctx.getSourceCode());

    yield createImportStatementFix(
      ctx,
      { package: "path", method: "path" },
      { asDefault: true }
    );
    yield createImportStatementFix(
      ctx,
      { package: "sanitize-filename", method: "sanitizeFilename" },
      {
        asDefault: true,
      }
    );

    if (!hasImplementationTemplateInPlace(ctx, config)) {
      yield fixer.insertTextAfterRange(
        finalRange,
        `\n\n${getImplementationTemplate(config, ctx)}`
      );
    }
  } else {
    yield createImportStatementFix(
      ctx,
      { package: importPath, method: config.sanitation.method },
      {
        asDefault: config.sanitation.defaultExport ?? false,
      }
    );
  }

  yield fixer.insertTextBefore(
    unsafeNode,
    `${config.sanitation.method}(__dirname, "${resolveConfigPath(
      config.root,
      path.dirname(ctx.getPhysicalFilename?.() ?? ctx.getFilename()),
      cwd
    )}", `
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

function hasImplementationTemplateInPlace(
  ctx: RuleContext<string, unknown[]>,
  config: Config
): boolean {
  return ctx
    .getSourceCode()
    .ast.body.filter((it): it is TSESTree.FunctionDeclaration =>
      isFunctionDeclaration(it)
    )
    .some((it) => it.id?.name === config.sanitation.method);
}
