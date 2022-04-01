import { TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import {
  isConstantTerminalNode,
  makeImportTerminalNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleImportExpression(
  ctx: HandlingContext,
  importExpression: TSESTree.ImportExpression
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, importExpression],
    },
  });

  const sourceNode = handleNode(
    deepMerge(nextCtx, {
      meta: { forceIdentifierLiteral: true },
      connection: { astNodes: [] },
    }),
    importExpression.source
  )[0];

  if (!isConstantTerminalNode(sourceNode)) {
    return [
      makeUnresolvedTerminalNode({
        astNodes: nextCtx.connection.astNodes,
        reason: "Unable to extract source",
        connection: nextCtx.connection,
        meta: nextCtx.meta,
      }),
    ];
  }

  return [
    makeImportTerminalNode({
      imported: "?",
      source: sourceNode.value,
      astNodes: [...nextCtx.connection.astNodes, ...sourceNode.astNodes],
      connection: nextCtx.connection,
      meta: nextCtx.meta,
    }),
  ];
}
