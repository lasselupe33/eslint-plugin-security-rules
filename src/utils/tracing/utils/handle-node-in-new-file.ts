import { TSESTree } from "@typescript-eslint/utils";

import {
  isClassDeclaration,
  isExportAllDeclaration,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isLiteral,
  isObjectPattern,
  isProperty,
  isVariableDeclaration,
  isVariableDeclarator,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { handleNode } from "../handlers/_handle-node";
import { HandlingContext } from "../types/context";
import { makeUnresolvedTerminalNode, TraceNode } from "../types/nodes";

import { getSourceCodeOfFile, NewFileSourceCode } from "./get-source-code";

type NodeToFollow =
  | {
      name: string | undefined;
      node: TSESTree.Node | null;
      local?: TSESTree.Identifier;
      source?: string;
    }
  | undefined;

/**
 * Handles all cases of export statements when being tasked with resolving the
 * relevant export node based on the imported identifier.
 */
export function handleNodeInNewFile(
  ctx: HandlingContext,
  { sourceCode, resolvedPath }: NewFileSourceCode,
  nodeIdentifierName: string,
  getAggregateIdentifier: (
    ctx: HandlingContext,
    currIdentifier: string
  ) => string | undefined
): TraceNode[] {
  if (!sourceCode?.scopeManager?.globalScope) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to extract globalScope in new file",
        connection: ctx.connection,
        astNodes: ctx.connection.astNodes,
        meta: ctx.meta,
      }),
    ];
  }

  const newFileCtx = deepMerge(ctx, {
    scope: sourceCode.scopeManager.globalScope,
    rootScope: sourceCode.scopeManager.globalScope,
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
    .flatMap<NodeToFollow>((it) => {
      if (isExportDefaultDeclaration(it)) {
        return [{ name: "default", node: it.declaration }];
      }

      // Firstly, determine if a simple expression, function or class is being
      // exported and if so we've found our variable
      if (isLiteral(it.declaration)) {
        return [{ name: "default", node: it.declaration }];
      } else if (
        isFunctionDeclaration(it.declaration) ||
        isClassDeclaration(it.declaration)
      ) {
        return [{ name: it.declaration.id?.name, node: it.declaration.id }];
      } else if (isVariableDeclaration(it.declaration)) {
        return it.declaration.declarations.flatMap<NodeToFollow>((it) => {
          if (isIdentifier(it.id)) {
            return [{ name: it.id.name, node: it.id }];
          } else if (isVariableDeclarator(it) && isObjectPattern(it.id)) {
            return it.id.properties.flatMap((property) => {
              if (
                isProperty(property) &&
                isIdentifier(it.init) &&
                isIdentifier(property.key) &&
                isIdentifier(property.value)
              ) {
                return {
                  name: property.value.name,
                  local: it.init,
                  node: property.key,
                };
              }
            });
          }
        });
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
  if ((nodeToFollow?.node || nodeToFollow?.local) && !nodeToFollow.source) {
    if (isIdentifier(nodeToFollow.node) && nodeToFollow.local) {
      newFileCtx.meta.memberPath.push(nodeToFollow.node.name);
    }
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
          meta: newFileCtx.meta,
        }),
      ];
    }

    return handleNodeInNewFile(
      newFileCtx,
      sourceCodeToFollow,
      nodeToFollow.local?.name ?? nodeIdentifierName,
      getAggregateIdentifier
    );
  }

  // In case we did not find a match at all on what we wanted to import, then it
  // may potentially live inside another file. Check if the current file has
  // exported from other files
  const exportAllDeclarations = sourceCode.ast.body.filter(
    (statement): statement is TSESTree.ExportAllDeclaration =>
      isExportAllDeclaration(statement)
  );

  const nextNodeIdentifier = getAggregateIdentifier(
    newFileCtx,
    nodeIdentifierName
  );

  for (const exportAllDeclaration of exportAllDeclarations) {
    if (!exportAllDeclaration.source) {
      continue;
    }

    const sourceCodeToFollow = getSourceCodeOfFile(
      newFileCtx.meta,
      exportAllDeclaration.source.value
    );

    if (!sourceCodeToFollow || !nextNodeIdentifier) {
      return [
        makeUnresolvedTerminalNode({
          reason: "Unable to extract globalScope in new file",
          connection: newFileCtx.connection,
          astNodes: newFileCtx.connection.astNodes,
          meta: newFileCtx.meta,
        }),
      ];
    }

    const matches = handleNodeInNewFile(
      newFileCtx,
      sourceCodeToFollow,
      nextNodeIdentifier,
      getAggregateIdentifier
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
      meta: newFileCtx.meta,
    }),
  ];
}
