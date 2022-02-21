import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

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
      nodeType: AST_NODE_TYPES.ImportSpecifier,
    },
  });

  const imported = importSpecifier.imported.name;
  const sourceNode = handleNode(nextCtx, importSpecifier.parent)[0];

  if (
    !isNodeTerminalNode(sourceNode) ||
    !isImportDeclaration(sourceNode.node)
  ) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to extract source",
        connection: nextCtx.connection,
      }),
    ];
  }

  // @TODO: handle following variable if not in node modules..

  return [
    makeImportTerminalNode({
      imported,
      source: sourceNode.node.source.value,
      connection: nextCtx.connection,
    }),
  ];
}
