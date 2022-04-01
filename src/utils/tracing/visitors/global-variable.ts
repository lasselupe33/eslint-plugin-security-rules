import { TSESTree } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { isCallExpression, isIdentifier, isLiteral } from "../../ast/guards";
import { HandlingContext } from "../types/context";
import {
  makeGlobalTerminalNode,
  makeImportTerminalNode,
  TraceNode,
} from "../types/nodes";
import { findNodeInConnection } from "../utils/find-node-in-connection";

export function visitGlobalVariable(
  ctx: HandlingContext,
  variable: Scope.Variable
): TraceNode[] {
  // Handle require imports
  if (variable.name === "require") {
    const importSource = findNodeInConnection(
      ctx.connection,
      (it): it is TSESTree.CallExpression =>
        isCallExpression(it) &&
        isIdentifier(it.callee) &&
        it.callee.name === "require"
    );
    const importPath =
      isLiteral(importSource?.arguments[0]) && importSource?.arguments[0].value
        ? String(importSource?.arguments[0].value)
        : undefined;

    if (importPath) {
      return [
        makeImportTerminalNode({
          imported: "?",
          source: importPath,
          astNodes: [],
          ...ctx,
        }),
      ];
    }
  }

  return [
    makeGlobalTerminalNode({
      name: variable.name,
      astNodes: [],
      ...ctx,
    }),
  ];
}
