import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { mapNodeToHandler } from "../../ast/map-node-to-handler";
import { HandlingContext } from "../types/context";
import { TraceNode } from "../types/nodes";

import { handleBinaryExpression } from "./binary-expression";
import { handleCallExpression } from "./call-expression";
import { handleIdentifier } from "./identifier";
import { handleImportSpecifier } from "./import-specifier";
import { handleLiteral } from "./literal";
import { handleMemberExpression } from "./member-expression";
import { handleObjectExpression } from "./object-expression";
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
      [AST_NODE_TYPES.MemberExpression]: handleMemberExpression,
      [AST_NODE_TYPES.ObjectExpression]: handleObjectExpression,
      [AST_NODE_TYPES.ImportSpecifier]: handleImportSpecifier,
    },
    context
  );

  return variables ?? [];
}
