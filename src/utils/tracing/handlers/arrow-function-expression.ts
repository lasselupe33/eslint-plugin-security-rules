import { ReturnStatement } from "@typescript-eslint/types/dist/ast-spec";
import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { isBlockStatement, isReturnStatement } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { getModuleScope } from "../../get-module-scope";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleArrowFunctionExpression(
  ctx: HandlingContext,
  arrowFunctionExpression: TSESTree.ArrowFunctionExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, arrowFunctionExpression],
    },
  });

  const returnStatements = !isBlockStatement(arrowFunctionExpression.body)
    ? [arrowFunctionExpression.body]
    : arrowFunctionExpression.body.body.filter(
        (node): node is ReturnStatement => isReturnStatement(node)
      );

  return returnStatements.flatMap((returnStatement) =>
    handleNode(
      deepMerge(nextCtx, {
        scope: getInnermostScope(
          getModuleScope(ctx.ruleContext.getScope()),
          returnStatement
        ),
      }),
      isReturnStatement(returnStatement)
        ? returnStatement.argument
        : returnStatement
    )
  );
}
