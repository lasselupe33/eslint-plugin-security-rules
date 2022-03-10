import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { makeMapNodeToHandler } from "../../ast/map-node-to-handler";
import { HandlingContext } from "../types/context";
import { makeUnresolvedTerminalNode, TraceNode } from "../types/nodes";

import { handleArrayExpression } from "./array-expression";
import { handleArrowFunctionExpression } from "./arrow-function-expression";
import { handleAssignmentExpression } from "./assignment-expression";
import { handleAwaitExpression } from "./await-expression";
import { handleBinaryExpression } from "./binary-expression";
import { handleCallExpression } from "./call-expression";
import { handleFunctionDeclaration } from "./function-declaration";
import { handleProperty } from "./handle-property";
import { handleIdentifier } from "./identifier";
import { handleImportDeclaration } from "./import-declaration";
import { handleImportDefaultSpecifier } from "./import-default-specifier";
import { handleImportSpecifier } from "./import-specifier";
import { handleLiteral } from "./literal";
import { handleMemberExpression } from "./member-expression";
import { handleObjectExpression } from "./object-expression";
import { handleTemplateElement } from "./template-element";
import { handleTemplateLiteral } from "./template-literal";
import { handleVariableDeclarator } from "./variable-declarator";

const mapNodeToHandler = makeMapNodeToHandler({ withLogs: false });

export function handleNode(
  context: HandlingContext,
  node: TSESTree.Node | undefined | null
): TraceNode[] {
  const variables = mapNodeToHandler(
    node,
    {
      [AST_NODE_TYPES.Literal]: handleLiteral,
      [AST_NODE_TYPES.Identifier]: handleIdentifier,
      [AST_NODE_TYPES.ArrayExpression]: handleArrayExpression,
      [AST_NODE_TYPES.AssignmentExpression]: handleAssignmentExpression,
      [AST_NODE_TYPES.VariableDeclarator]: handleVariableDeclarator,
      [AST_NODE_TYPES.CallExpression]: handleCallExpression,
      [AST_NODE_TYPES.BinaryExpression]: handleBinaryExpression,
      [AST_NODE_TYPES.ArrowFunctionExpression]: handleArrowFunctionExpression,
      [AST_NODE_TYPES.TemplateLiteral]: handleTemplateLiteral,
      [AST_NODE_TYPES.TemplateElement]: handleTemplateElement,
      [AST_NODE_TYPES.MemberExpression]: handleMemberExpression,
      [AST_NODE_TYPES.ObjectExpression]: handleObjectExpression,
      [AST_NODE_TYPES.Property]: handleProperty,
      [AST_NODE_TYPES.AwaitExpression]: handleAwaitExpression,
      [AST_NODE_TYPES.FunctionDeclaration]: handleFunctionDeclaration,
      [AST_NODE_TYPES.ImportSpecifier]: handleImportSpecifier,
      [AST_NODE_TYPES.ImportDeclaration]: handleImportDeclaration,
      [AST_NODE_TYPES.ImportDefaultSpecifier]: handleImportDefaultSpecifier,
      fallback: (ctx, node) => [
        makeUnresolvedTerminalNode({
          astNodes: [...ctx.connection.astNodes, node],
          reason: `No handler for ${node.type}`,
          connection: ctx.connection,
        }),
      ],
    },
    context
  );

  return variables ?? [];
}
