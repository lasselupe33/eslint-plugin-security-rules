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
import { getSourceCodeOfFile } from "../utils/get-source-code";
import { handleNodeInNewFile } from "../utils/handle-node-in-new-file";

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

  const imported = importDefaultSpecifier.local.name;
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
        meta: nextCtx.meta,
      }),
    ];
  }

  const sourceCodeToFollow = getSourceCodeOfFile(
    ctx.meta,
    sourceNode.astNode.source.value
  );

  // In case we need to traverse into a new file in the source code, then do so
  // now by calling handleNode on the node from the new file.
  if (
    sourceCodeToFollow &&
    sourceCodeToFollow.sourceCode?.scopeManager?.globalScope
  ) {
    return handleNodeInNewFile(nextCtx, sourceCodeToFollow, "default", (ctx) =>
      ctx.meta.memberPath.pop()
    );
  }

  return [
    makeImportTerminalNode({
      imported,
      source: sourceNode.astNode.source.value,
      connection: nextCtx.connection,
      astNodes: [...nextCtx.connection.astNodes, sourceNode.astNode],
      meta: nextCtx.meta,
    }),
  ];
}
