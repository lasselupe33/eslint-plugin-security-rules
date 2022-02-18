import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import {
  isConstantTerminalNode,
  makeConstantTerminalNode,
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
    !isConstantTerminalNode(sourceNode) ||
    typeof sourceNode.value !== "string"
  ) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to extract source",
        connection: nextCtx.connection,
      }),
    ];
  }

  return [
    makeConstantTerminalNode({
      value: {
        imported,
        source: sourceNode.value,
      },
      connection: nextCtx.connection,
    }),
  ];
}
