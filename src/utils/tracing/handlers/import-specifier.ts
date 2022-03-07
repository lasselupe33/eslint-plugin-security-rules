import { TSESTree } from "@typescript-eslint/utils";

import {
  isExportNamedDeclaration,
  isIdentifier,
  isImportDeclaration,
  isVariableDeclaration,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import {
  isNodeTerminalNode,
  makeImportTerminalNode,
  makeUnresolvedTerminalNode,
  TraceNode,
} from "../types/nodes";
import { getSourceCodeOfFile } from "../utils/get-source-code";

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

  const sourceCodeToFollow = getSourceCodeOfFile(
    ctx.meta,
    sourceNode.astNode.source.value
  );

  if (
    sourceCodeToFollow &&
    sourceCodeToFollow.sourceCode.scopeManager?.globalScope
  ) {
    const newFileCtx = deepMerge(nextCtx, {
      scope: sourceCodeToFollow.sourceCode.scopeManager?.globalScope,
      rootScope: sourceCodeToFollow.sourceCode.scopeManager?.globalScope,
      meta: {
        filePath: sourceCodeToFollow.resolvedPath,
      },
    });

    const nodeToFollow = sourceCodeToFollow.sourceCode.ast.body
      .filter(
        (
          statement
        ): statement is TSESTree.ExportNamedDeclaration & {
          declaration: TSESTree.VariableDeclaration;
        } =>
          isExportNamedDeclaration(statement) &&
          isVariableDeclaration(statement.declaration)
      )
      .flatMap((it) => it.declaration.declarations)
      .find((it) => isIdentifier(it.id) && it.id.name === imported);

    return handleNode(newFileCtx, nodeToFollow);
  }

  return [
    makeImportTerminalNode({
      imported,
      source: sourceNode.astNode.source.value,
      astNodes: [...nextCtx.connection.astNodes, sourceNode.astNode],
      connection: ctx.connection,
    }),
  ];
}
