import { TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";
import { getReturnStatements } from "../utils/get-return-statements";

import { handleNode } from "./_handle-node";

export function handleFunctionDeclaration(
  ctx: HandlingContext,
  functionDeclaration: TSESTree.FunctionDeclaration
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, functionDeclaration],
    },
  });

  // In case we encounter an anonymous function we cannot create proper mappings
  // between arguments and parameters (given the current implementation), in
  // this case we do our best efforts to trace the function implementation.
  if (!functionDeclaration.id) {
    const functionScope = getInnermostScope(ctx.rootScope, functionDeclaration);

    return getReturnStatements(functionDeclaration.body.body).flatMap((it) =>
      handleNode(
        deepMerge(nextCtx, {
          connection: { astNodes: [...nextCtx.connection.astNodes, it] },
          scope: getInnermostScope(functionScope, it),
        }),
        it.argument
      )
    );
  }

  return handleNode(nextCtx, functionDeclaration.id);
}
