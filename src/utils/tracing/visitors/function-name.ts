import { ReturnStatement } from "@typescript-eslint/types/dist/ast-spec";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { isFunctionDeclaration, isReturnStatement } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { getModuleScope } from "../../get-module-scope";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

export function visitFunctionName(
  ctx: HandlingContext,
  functionName: Scope.Definition
): TraceNode[] {
  if (!isFunctionDeclaration(functionName.node)) {
    return [];
  }

  const returnStatements = functionName.node.body.body.filter(
    (node): node is ReturnStatement => isReturnStatement(node)
  );

  return returnStatements.flatMap((returnStatement) =>
    handleNode(
      deepMerge(ctx, {
        scope: getInnermostScope(
          getModuleScope(ctx.ruleContext.getScope()),
          returnStatement
        ),
      }),
      returnStatement.argument
    )
  );
}
