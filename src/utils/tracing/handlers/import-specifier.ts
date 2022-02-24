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

export function handleImportSpecifier(
  ctx: HandlingContext,
  importSpecifier: TSESTree.ImportSpecifier
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, importSpecifier],
    },
  });

  const imported = importSpecifier.imported.name;
  const sourceNode = handleNode(
    deepMerge(nextCtx, { connection: { astNodes: [] } }),
    importSpecifier.parent
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

  // @TODO: handle following variable if not in node modules..

  return [
    makeImportTerminalNode({
      imported,
      source: sourceNode.astNode.source.value,
      astNodes: [...nextCtx.connection.astNodes, sourceNode.astNode],
      connection: ctx.connection,
    }),
  ];
}
