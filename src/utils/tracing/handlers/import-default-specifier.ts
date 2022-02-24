import { TSESTree } from "@typescript-eslint/utils";

import { isImportDeclaration } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import {
  isNodeTerminalNode,
  makeImportTerminalNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleImportDefaultSpecifier(
  ctx: HandlingContext,
  importDefaultSpecifier: TSESTree.ImportDefaultSpecifier
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, importDefaultSpecifier],
    },
  });

  const imported =
    nextCtx.meta.memberPath.pop() ?? importDefaultSpecifier.local.name;
  const sourceNode = handleNode(
    deepMerge(nextCtx, { connection: { astNodes: [] } }),
    importDefaultSpecifier.parent
  )[0];

  if (
    !isNodeTerminalNode(sourceNode) ||
    !isImportDeclaration(sourceNode.astNode)
  ) {
    return [
      makeUnresolvedTerminalNode({
        astNodes: nextCtx.connection.astNodes,
        reason: "Unable to extract source",
        connection: nextCtx.connection,
      }),
    ];
  }

  return [
    makeImportTerminalNode({
      imported,
      source: sourceNode.astNode.source.value,
      connection: nextCtx.connection,
      astNodes: [...nextCtx.connection.astNodes, sourceNode.astNode],
    }),
  ];
}
