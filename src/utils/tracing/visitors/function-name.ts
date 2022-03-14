import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { isFunctionDeclaration } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import { makeUnresolvedTerminalNode, TraceNode } from "../types/nodes";
import { getReturnStatements } from "../utils/get-return-statements";

export function visitFunctionName(
  ctx: HandlingContext,
  functionName: Scope.Definition
): TraceNode[] {
  if (!isFunctionDeclaration(functionName.node)) {
    return [
      makeUnresolvedTerminalNode({
        reason: `Unable to visit function`,
        connection: ctx.connection,
        astNodes: ctx.connection.astNodes,
        meta: ctx.meta,
      }),
    ];
  }

  const functionScope = getInnermostScope(ctx.rootScope, functionName.node);

  return getReturnStatements(functionName.node.body.body).flatMap(
    (returnStatement) =>
      handleNode(
        deepMerge(ctx, {
          scope: getInnermostScope(functionScope, returnStatement),
        }),
        returnStatement.argument
      )
  );
}
