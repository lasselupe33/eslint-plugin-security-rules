import { TSESTree } from "@typescript-eslint/utils";

import {
  isExportAllDeclaration,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isImportDeclaration,
  isLiteral,
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
import {
  getSourceCodeOfFile,
  NewFileSourceCode,
} from "../utils/get-source-code";

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

  // In case we need to traverse into a new file in the source code, then do so
  // now by calling handleNode on the node from the new file.
  if (
    sourceCodeToFollow &&
    sourceCodeToFollow.sourceCode.scopeManager?.globalScope
  ) {
    return handleNodeInNewFile(nextCtx, sourceCodeToFollow, imported);
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

function handleNodeInNewFile(
  ctx: HandlingContext,
  { sourceCode, resolvedPath }: NewFileSourceCode,
  nodeIdentifierName: string
): TraceNode[] {
  if (!sourceCode.scopeManager?.globalScope) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to extract globalScope in new file",
        connection: ctx.connection,
        astNodes: ctx.connection.astNodes,
      }),
    ];
  }

  const newFileCtx = deepMerge(ctx, {
    scope: sourceCode.scopeManager?.globalScope,
    rootScope: sourceCode.scopeManager?.globalScope,
    meta: {
      filePath: resolvedPath,
    },
  });

  const nodeToFollow = sourceCode.ast.body
    .filter(
      (
        statement
      ): statement is
        | TSESTree.ExportNamedDeclaration
        | TSESTree.ExportDefaultDeclaration =>
        isExportNamedDeclaration(statement) ||
        isExportDefaultDeclaration(statement)
    )
    .flatMap<{
      name: string | undefined;
      node: TSESTree.Identifier | TSESTree.Literal | null;
      local?: TSESTree.Identifier;
      source?: string;
    } | null>((it) => {
      // Firstly, determine if a simple expression, function or class is being
      // exported and if so we've found our variable
      if (isLiteral(it.declaration)) {
        return [{ name: "default", node: it.declaration }];
      } else if (isFunctionDeclaration(it.declaration)) {
        return [{ name: it.declaration.id?.name, node: it.declaration.id }];
      } else if (isVariableDeclaration(it.declaration)) {
        return it.declaration.declarations.map((it) =>
          isIdentifier(it.id) ? { name: it.id.name, node: it.id } : null
        );
      }

      if (isExportDefaultDeclaration(it)) {
        return [];
      }

      // ... else we need to determine how the variables are being specified
      // (e.g. through new export statements)
      return it.specifiers.map((specifier) => ({
        name: specifier.exported.name,
        node: specifier.exported,
        local: specifier.local,
        source: it.source?.value,
      }));
    })
    .find((it) => it?.name === nodeIdentifierName);

  // In case the matched node lives inside the current file (i.e. it is not
  // exported from a different source), then simply trace within this file.
  if (nodeToFollow?.node && !nodeToFollow.source) {
    return handleNode(newFileCtx, nodeToFollow.local ?? nodeToFollow.node);
  }

  // In case the matched node lives within another source, then continue the
  // trace into new files!
  if (nodeToFollow?.source) {
    const sourceCodeToFollow = getSourceCodeOfFile(
      newFileCtx.meta,
      nodeToFollow.source
    );

    if (!sourceCodeToFollow) {
      return [
        makeUnresolvedTerminalNode({
          reason: "Unable to extract sourceCode to follow",
          connection: newFileCtx.connection,
          astNodes: newFileCtx.connection.astNodes,
        }),
      ];
    }

    return handleNodeInNewFile(
      newFileCtx,
      sourceCodeToFollow,
      nodeToFollow.local?.name ?? nodeIdentifierName
    );
  }

  // In case we did not find a match at all on what we wanted to import, then it
  // may potentially live inside another file. Check if the current file has
  // exported from other files
  const exportAllDeclarations = sourceCode.ast.body.filter(
    (statement): statement is TSESTree.ExportAllDeclaration =>
      isExportAllDeclaration(statement)
  );

  for (const exportAllDeclaration of exportAllDeclarations) {
    if (!exportAllDeclaration.source) {
      continue;
    }

    const sourceCodeToFollow = getSourceCodeOfFile(
      newFileCtx.meta,
      exportAllDeclaration.source.value
    );

    if (!sourceCodeToFollow) {
      return [
        makeUnresolvedTerminalNode({
          reason: "Unable to extract globalScope in new file",
          connection: newFileCtx.connection,
          astNodes: newFileCtx.connection.astNodes,
        }),
      ];
    }

    const matches = handleNodeInNewFile(
      newFileCtx,
      sourceCodeToFollow,
      nodeIdentifierName
    );

    if (matches) {
      return matches;
    }
  }

  return [
    makeUnresolvedTerminalNode({
      reason: "Unable to follow import",
      connection: newFileCtx.connection,
      astNodes: newFileCtx.connection.astNodes,
    }),
  ];
}
