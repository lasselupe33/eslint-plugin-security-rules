import { readFileSync } from "fs";
import path from "path";

import { parseForESLint } from "@typescript-eslint/parser";
import { Linter, Rule, Scope, SourceCode } from "eslint";
import { findVariable } from "eslint-utils";
import {
  CallExpression,
  Expression,
  FunctionDeclaration,
  SpreadElement,
  VariableDeclarator,
} from "estree";

import { getAssignmentType } from "../utils/getAssignmentType";
import { getFunctionScopeByName } from "../utils/getFunctionScopeByName";

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

          traceVariable(
            context.getSourceCode(),
            [context.getScope()],
            startVariable,
            { filename: context.getFilename() }
          );

          // while (next !== null) {
          //   curr = next;
          // }

          // const declarationName =
          //   curr.defs[0]?.node?.init?.argument?.callee?.name;

          // const ref = context
          //   .getScope()
          // .references.find((it) => it.identifier.name ===
          // declarationName);

          // const importDeclaration = getImportValue(
          //   ref?.resolved?.defs[0]?.parent
          // );

          // if (typeof importDeclaration === "string") {
          //   loadDifferentFile(
          //     path.dirname(context.getFilename()),
          //     importDeclaration
          //   );
          // }
        }
      }
    },

    // VariableDeclaration: (node) => {
    //   for (const declaration of node.declarations) {
    //     if (
    //       declaration.init?.type !== "AwaitExpression" ||
    // declaration.init.argument.type !== "CallExpression"
    // || declaration.init.argument.callee.type !==
    // "Identifier" ) {
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
    // // Go through all alterations to determine if
    // variable is safe for (const entry of
    // intermediateDeclarations.values()) { // Is it safe???
    //         // console.log(entry.name);
    //       }
    //     }

    // const value = declaration.init.argument.callee.name;
    // console.log(value);
    //   }
    // },
  };
}

function traceVariable(
  sourceCode: SourceCode,
  scopes: Scope.Scope[],
  variableOrVariableName: Scope.Variable | string | null | undefined,
  traceContext: {
    filename: string;
    functionArguments?: (Expression | SpreadElement)[];
  }
): void {
  const rootScope = scopes[0];
  const scope = scopes[scopes.length - 1];

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

  console.log(variable.name);

  const assignmentType = getAssignmentType(rootScope, variable);

  switch (assignmentType) {
    case "parameter": {
      const boundVar = variable;
      const functionScopeBlock = scope.block as FunctionDeclaration;
      const parameterIndex = functionScopeBlock.params.findIndex(
        (it) => it.type === "Identifier" && it.name === boundVar.name
      );

      const variableToFollow = traceContext.functionArguments?.[parameterIndex];

      if (variableToFollow?.type !== "Identifier") {
        return;
      }

      const nextScopes = scopes.slice(0, -1);
      traceVariable(
        sourceCode,
        nextScopes,
        variableToFollow.name,
        traceContext
      );
      break;
    }

    case "variable": {
      const nextVariable = variable?.defs[0]?.node.init;

      if (!nextVariable) {
        return;
      }

      traceVariable(
        sourceCode,
        scopes,
        findVariable(scope, nextVariable),
        traceContext
      );
      break;
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
        traceVariable(sourceCode, [...scopes, nextScope], returnVariable, {
          ...traceContext,
          functionArguments: callExpression.arguments,
        });
      }

      break;
    }

    case "import": {
      const importName = variable.defs[0]?.node?.init?.argument?.callee?.name;
      const importRef = rootScope.references.find(
        (it) => it.identifier.name === importName
      );

      const importPath = getImportValue(importRef);

      if (typeof importPath === "string") {
        traceIntoNextFile(
          path.dirname(traceContext.filename),
          importPath,
          importName
        );
      }
      break;
    }
  }
}

function getImportValue(ref?: Scope.Reference | null) {
  return ref?.resolved?.defs[0]?.parent?.type === "ImportDeclaration"
    ? ref?.resolved?.defs[0]?.parent.source.value
    : null;
}

function traceIntoNextFile(
  baseDir: string,
  filename: string,
  functionToFollow: string
) {
  if (baseDir === "<input>") {
    console.warn(
      "Multi-file parsing is not supported when piping input into ESLint"
    );
    return;
  }

  const linter = new Linter();
  const fileName = require.resolve(path.join(baseDir, `${filename}.ts`));

  const code = readFileSync(fileName, "utf-8");

  // @ts-expect-error tmpp
  linter.defineParser("test", { parseForESLint });
  // linter.defineRule("tmp-rule", {
  //   meta: {
  //     type: "layout",
  //     fixable: "code",
  //   },
  //   create: createRule,
  // });

  linter.verify(
    code,
    {
      parser: "test",
    },
    { filename: fileName }
  );

  const scope = getFunctionScopeByName(
    linter.getSourceCode(),
    functionToFollow
  );

  if (!scope) {
    return;
  }

  traceVariable(
    linter.getSourceCode(),
    [scope],
    scope?.variables[scope.variables.length - 1],
    {
      filename: fileName,
    }
  );
}
