import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { mapNodeToHandler } from "../../map-node-to-handler";
import { HandlingContext, TraceNode } from "../types";

import { handleBinaryExpression } from "./binary-expression";
import { handleCallExpression } from "./call-expression";
import { handleIdentifier } from "./identifier";
import { handleLiteral } from "./literal";
import { handleTemplateElement } from "./template-element";
import { handleTemplateLiteral } from "./template-literal";

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
      [AST_NODE_TYPES.BinaryExpression]: handleBinaryExpression,
      [AST_NODE_TYPES.TemplateLiteral]: handleTemplateLiteral,
      [AST_NODE_TYPES.TemplateElement]: handleTemplateElement,
    },
    context
  );

  return variables ?? [];
}
