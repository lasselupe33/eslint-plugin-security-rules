import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { makeNodeTerminalNode, TraceNode } from "../types/nodes";

export function handleImportSpecifier(
  ctx: HandlingContext,
  importSpecifier: TSESTree.ImportSpecifier
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      nodeType: AST_NODE_TYPES.ImportSpecifier,
    },
  });

  // const imported = importSpecifier.imported.name;
  // const sourceNode = handleNode(nextCtx, importSpecifier.parent)[0];

  // if (!isConstantTerminalNode(sourceNode)) {
  //   return [
  //     makeUnresolvedTerminalNode({
  //       reason: "Unable to extract source",
  //       connection: nextCtx.connection,
  //     }),
  //   ];
  // }

  // @TODO: handle following variable if not in node modules..

  return [
    makeNodeTerminalNode({
      node: importSpecifier,
      nodeType: importSpecifier.type,
      connection: nextCtx.connection,
    }),
  ];
}
