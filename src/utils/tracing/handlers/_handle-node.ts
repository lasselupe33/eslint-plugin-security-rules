import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { mapNodeToHandler } from "../../mapNodeToHandler";
import { HandlingContext, TraceNode } from "../types";

import { handleCallExpression } from "./callExpression";
import { handleIdentifier } from "./identifier";
import { handleLiteral } from "./literal";

export function handleNode(
  context: HandlingContext,
  node: TSESTree.Node | undefined | null
): TraceNode[] {
  const variables = mapNodeToHandler(
    node,
    {
      [AST_NODE_TYPES.Literal]: handleLiteral,
      [AST_NODE_TYPES.Identifier]: handleIdentifier,
      [AST_NODE_TYPES.CallExpression]: handleCallExpression,
    },
    context
  );

  if (node && !variables) {
    console.warn(
      `traceVariable.handleNode(): No handler associated to type.`,
      node.type
    );
  }

  return variables ?? [];
}
