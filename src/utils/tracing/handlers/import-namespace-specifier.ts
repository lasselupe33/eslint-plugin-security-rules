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

export function handleImportNamespaceSpecifier(
  ctx: HandlingContext,
  importNamespaceSpecifier: TSESTree.ImportNamespaceSpecifier
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, importNamespaceSpecifier],
    },
  });

  const sourceNode = handleNode(
    deepMerge(nextCtx, { connection: { astNodes: [] } }),
    importNamespaceSpecifier.parent
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
  const nodeToFollow = ctx.meta.memberPath.pop();

  // In case we need to traverse into a new file in the source code, then do so
  // now by calling handleNode on the node from the new file.
  if (
    sourceCodeToFollow &&
    sourceCodeToFollow.sourceCode?.scopeManager?.globalScope &&
    nodeToFollow
  ) {
    return handleNodeInNewFile(
      nextCtx,
      sourceCodeToFollow,
      nodeToFollow,
      (ctx, currIdentifier) => currIdentifier
    );
  }

  return [
    makeImportTerminalNode({
      imported: "*",
      source: sourceNode.astNode.source.value,
      connection: nextCtx.connection,
      astNodes: [...nextCtx.connection.astNodes, sourceNode.astNode],
      meta: nextCtx.meta,
    }),
  ];
}
