import { TSESTree } from "@typescript-eslint/utils";

import { isReturnStatement } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleFunctionExpression(
  ctx: HandlingContext,
  functionExpression: TSESTree.FunctionExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, functionExpression],
    },
  });

  // In case we encounter an anonymous function we cannot create proper mappings
  // between arguments and parameters (given the current implementation), in
  // this case we do our best efforts to trace the function implementation.
  if (!functionExpression.id) {
    return functionExpression.body.body
      .filter((it): it is TSESTree.ReturnStatement => isReturnStatement(it))
      .flatMap((it) =>
        handleNode(
          deepMerge(nextCtx, {
            connection: { astNodes: [...nextCtx.connection.astNodes, it] },
          }),
          it.argument
        )
      );
  }

  return handleNode(nextCtx, functionExpression.id);
}
