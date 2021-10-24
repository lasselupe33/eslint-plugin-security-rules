import { readFileSync } from "fs";
import path from "path";

import { parseForESLint } from "@typescript-eslint/parser";
import { Linter, Rule, Scope } from "eslint";
import { findVariable } from "eslint-utils";
import { ImportDeclaration, VariableDeclaration } from "estree";

export const multiFileRule: Rule.RuleModule = {
  meta: {
    type: "layout",
    fixable: "code",
  },
  create: createRule,
};

function createRule(context: Rule.RuleContext): Rule.RuleListener {
  return {
    AssignmentExpression: (node) => {
      if (
        node.left.type === "MemberExpression" &&
        node.left.property.type === "Identifier" &&
        node.left.property.name === "innerHTML"
      ) {
        if ("name" in node.right) {
          const startVariable = findVariable(context.getScope(), node.right);

          if (!startVariable) {
            return;
          }

          let curr: Scope.Variable = startVariable;
          let next: Scope.Variable | null = startVariable;

          while (next !== null) {
            curr = next;
            next = resolveParentVariable(context, curr);
          }

          const declarationName =
            curr.defs[0]?.node?.init?.argument?.callee?.name;

          const ref = context
            .getScope()
            .references.find((it) => it.identifier.name === declarationName);

          const importDeclaration = getImportValue(
            ref?.resolved?.defs[0]?.parent
          );

          if (typeof importDeclaration === "string") {
            loadDifferentFile(path.join(context.getCwd()), importDeclaration);
          }
        }
      }
    },

    // VariableDeclaration: (node) => {
    //   for (const declaration of node.declarations) {
    //     if (
    //       declaration.init?.type !== "AwaitExpression" ||
    //       declaration.init.argument.type !== "CallExpression" ||
    //       declaration.init.argument.callee.type !== "Identifier"
    //     ) {
    //       continue;
    //     }

    //     const rootDeclaration = findVariable(
    //       context.getScope(),
    //       declaration.init.argument.callee
    //     );

    //     if (!rootDeclaration) {
    //       return;
    //     }

    //     const intermediateDeclarations =
    //       rootDeclaration.references[0]?.from.set;

    //     if (intermediateDeclarations) {
    //       // Go through all alterations to determine if variable is safe
    //       for (const entry of intermediateDeclarations.values()) {
    //         // Is it safe???
    //         // console.log(entry.name);
    //       }
    //     }

    //     const value = declaration.init.argument.callee.name;
    //     console.log(value);
    //   }
    // },
  };
}

function resolveParentVariable(
  context: Rule.RuleContext,
  variable: Scope.Variable
): Scope.Variable | null {
  if (variable?.defs[0]?.node.type === "VariableDeclarator") {
    return findVariable(context.getScope(), variable?.defs[0]?.node.init);
  }

  return null;
}

function getImportValue(
  node?: ImportDeclaration | VariableDeclaration | null | undefined
) {
  return node?.type === "ImportDeclaration" ? node.source.value : null;
}

function loadDifferentFile(baseDir: string, filename: string) {
  if (baseDir === "<input>") {
    return;
  }

  const linter = new Linter();

  const code = readFileSync(
    require.resolve(
      path.join(baseDir, "./src/tests/files/multi-file-rule", filename)
    ),
    "utf-8"
  );

  // @ts-expect-error tmpp
  linter.defineParser("test", { parseForESLint });
  linter.defineRule("tmp-rule", {
    meta: {
      type: "layout",
      fixable: "code",
    },
    create: createRule,
  });

  const res = linter.verify(
    code,
    {
      parser: "test",
      rules: { "tmp-rule": "error" },
    },
    { filename: "./api.ts" }
  );

  console.log(res);
}
