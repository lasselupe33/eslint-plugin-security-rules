import { readFileSync } from "fs";
import path from "path";

import { Linter, Rule, Scope, SourceCode } from "eslint";
import { findVariable } from "eslint-utils";
import {
  CallExpression,
  Expression,
  FunctionDeclaration,
  SpreadElement,
  VariableDeclarator,
} from "estree";

import { createCache } from "../utils/cache";
import { getAssignmentType } from "../utils/getAssignmentType";
import { getFunctionScopeByName } from "../utils/getFunctionScopeByName";

const ENABLE_CACHE = true;
const cache = createCache<SourceCode>();

export const multiFileRule: Rule.RuleModule = {
  meta: {
    type: "layout",
    fixable: "code",
    hasSuggestions: true,
  },
  create: createRule,
};

function createRule(context: Rule.RuleContext): Rule.RuleListener {
  if (ENABLE_CACHE) {
    cache.set(context.getFilename(), context.getSourceCode());
  }

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

          traceVariable(
            context.getSourceCode(),
            [{ scope: context.getScope() }],
            startVariable,
            { filename: context.getFilename() },
            context.parserPath
          );
          context.report({
            message: "oh no",
            loc: node.loc ?? { line: 1, column: 1 },
            suggest: [
              {
                desc: "suggestion a",
                fix: (fixer) => {
                  return fixer.insertTextAfter(node, "a");
                },
              },
              {
                desc: "suggestion b",
                fix: function* fix(fixer) {
                  yield fixer.insertTextAfter(node, "b");
                  yield fixer.insertTextAfter(node, "c");
                },
              },
            ],
          });
        }
      }
    },
  };
}

function traceVariable(
  sourceCode: SourceCode,
  scopes: {
    scope: Scope.Scope;
    functionArguments?: (Expression | SpreadElement)[];
  }[],
  variableOrVariableName: Scope.Variable | string | null | undefined,
  traceContext: {
    filename: string;
  },
  parserPath: string
): void {
  const rootScope = scopes[0]?.scope;
  const { scope, functionArguments } = scopes[scopes.length - 1] ?? {};

  if (!rootScope || !scope) {
    return;
  }

  let variable = variableOrVariableName;

  if (typeof variable === "string") {
    variable = scope.variables.find((it) => it?.name === variable);
  }

  if (!variable) {
    return;
  }

  const assignmentType = getAssignmentType(scope, variable);
  // console.log(variable.name, assignmentType, scopes.length);

  switch (assignmentType) {
    case "variable": {
      const nextVariable = variable?.defs[0]?.node.init;

      if (!nextVariable) {
        return;
      }

      traceVariable(
        sourceCode,
        scopes,
        findVariable(scope, nextVariable),
        traceContext,
        parserPath
      );
      return;
    }

    case "function": {
      const callExpression = (variable.defs[0]?.node as VariableDeclarator)
        .init as CallExpression;

      if (callExpression.callee.type === "Identifier") {
        const nextScope = getFunctionScopeByName(
          sourceCode,
          callExpression.callee?.name
        );

        if (!nextScope) {
          return;
        }

        const returnVariable =
          nextScope.variables[nextScope.variables.length - 1];

        traceVariable(
          sourceCode,
          [
            ...scopes,
            { scope: nextScope, functionArguments: callExpression.arguments },
          ],
          returnVariable,
          traceContext,
          parserPath
        );
      }

      return;
    }

    case "parameter": {
      const boundVar = variable;
      const functionScopeBlock = scope.block as FunctionDeclaration;
      const parameterIndex = functionScopeBlock.params.findIndex(
        (it) => it.type === "Identifier" && it.name === boundVar.name
      );

      const variableToFollow = functionArguments?.[parameterIndex];

      if (variableToFollow?.type !== "Identifier") {
        return;
      }

      const nextScopes = scopes.slice(0, -1);
      traceVariable(
        sourceCode,
        nextScopes,
        variableToFollow.name,
        traceContext,
        parserPath
      );
      return;
    }

    case "import": {
      const importName = variable.defs[0]?.node?.init?.argument?.callee?.name;
      const importRef = scope.references.find(
        (it) => it.identifier.name === importName
      );

      const importPath = getImportValue(importRef);

      if (typeof importPath !== "string" || typeof importName !== "string") {
        return;
      }

      const nextFile = getSourceCodeOfFile(
        path.dirname(traceContext.filename),
        importPath,
        parserPath
      );

      if (!nextFile?.sourceCode) {
        return;
      }

      // @TODO determine if import is function, variable or something else.
      // For now we assume that the import will always be a function.
      // (Hence the code below matches the "function" case)

      const nextScope = getFunctionScopeByName(nextFile.sourceCode, importName);

      if (!nextScope) {
        return;
      }

      traceVariable(
        nextFile.sourceCode,
        [...scopes, { scope: nextScope }],
        nextScope.variables[nextScope.variables.length - 1],
        {
          filename: nextFile.resolvedPath,
        },
        parserPath
      );

      return;
    }
  }
}

function getImportValue(ref?: Scope.Reference | null) {
  return ref?.resolved?.defs[0]?.parent?.type === "ImportDeclaration"
    ? ref?.resolved?.defs[0]?.parent.source.value
    : null;
}

function getSourceCodeOfFile(
  baseDir: string,
  filename: string,
  parserPath: string
): undefined | { sourceCode: SourceCode | undefined; resolvedPath: string } {
  if (baseDir === "<input>") {
    console.warn(
      "Multi-file parsing is not supported when piping input into ESLint"
    );
    return;
  }

  try {
    const filePath = require.resolve(path.join(baseDir, `${filename}.ts`));
    const sourceCode = getSourceCode(filePath, parserPath);

    return { sourceCode, resolvedPath: filePath };
  } catch (err) {
    console.warn(err);
  }
}

function getSourceCode(path: string, parserPath: string): SourceCode {
  const cachedSource = cache.get(path);

  if (cachedSource) {
    return cachedSource;
  }

  const linter = new Linter();
  const code = readFileSync(path, "utf-8");

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  linter.defineParser("test", require(parserPath));
  // linter.defineRule("tmp-rule", {
  //   meta: {
  //     type: "layout",
  //     fixable: "code",
  //   },
  //   create: createRule,
  // });

  linter.verify(
    cachedSource ?? code,
    {
      parser: "test",
    },
    { filename: path }
  );

  const sourceCode = linter.getSourceCode();

  if (ENABLE_CACHE) {
    cache.set(path, sourceCode);
  }

  return sourceCode;
}
