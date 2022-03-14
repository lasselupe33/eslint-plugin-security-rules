import { TSESTree } from "@typescript-eslint/utils";

import {
  isExportDefaultDeclaration,
  isImportDeclaration,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import {
  isNodeTerminalNode,
  makeImportTerminalNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";
import {
  getSourceCodeOfFile,
  NewFileSourceCode,
} from "../utils/get-source-code";

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
    return handleNodeInNewFile(nextCtx, sourceCodeToFollow);
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

function handleNodeInNewFile(
  ctx: HandlingContext,
  { sourceCode, resolvedPath }: NewFileSourceCode
): TraceNode[] {
  if (!sourceCode?.scopeManager?.globalScope) {
    return [];
  }

  // Extract the name of the node that we need to follow in the new file.
  const nodeToFollow = handleNode(
    deepMerge(ctx, {
      meta: { forceIdentifierLiteral: true },
      connection: { astNodes: [] },
    }),
    sourceCode.ast.body.find(
      (statement): statement is TSESTree.ExportDefaultDeclaration =>
        isExportDefaultDeclaration(statement)
    )?.declaration
  )[0];

  const newFileCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, ...(nodeToFollow?.astNodes ?? [])],
    },
    scope: sourceCode.scopeManager.globalScope,
    rootScope: sourceCode.scopeManager.globalScope,
    meta: {
      filePath: resolvedPath,
    },
  });

  return handleNode(
    newFileCtx,
    nodeToFollow?.astNodes[nodeToFollow.astNodes.length - 1]
  );
}
