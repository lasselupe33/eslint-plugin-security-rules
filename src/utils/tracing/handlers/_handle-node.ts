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
import { handleChainExpression } from "./chain-expression";
import { handleClassExpression } from "./class-expression";
import { handleConditionalExpression } from "./conditional-expression";
import { handleForOfStatement } from "./for-of-statement";
import { handleFunctionDeclaration } from "./function-declaration";
import { handleFunctionExpression } from "./function-expression";
import { handleIdentifier } from "./identifier";
import { handleImportDeclaration } from "./import-declaration";
import { handleImportDefaultSpecifier } from "./import-default-specifier";
import { handleImportNamespaceSpecifier } from "./import-namespace-specifier";
import { handleImportSpecifier } from "./import-specifier";
import { handleLiteral } from "./literal";
import { handleLogicalExpression } from "./logical-expression";
import { handleMemberExpression } from "./member-expression";
import { handleNewExpression } from "./new-expression";
import { handleObjectExpression } from "./object-expression";
import { handleProperty } from "./property";
import { handleSequenceExpression } from "./sequence-expression";
import { handleSpreadElement } from "./spread-element";
import { handleSuper } from "./super";
import { handleTaggedTemplateExpression } from "./tagged-template-expression";
import { handleTemplateElement } from "./template-element";
import { handleTemplateLiteral } from "./template-literal";
import { handleThisExpression } from "./this-expression";
import { handleTSAsExpression } from "./ts-as-expression";
import { handleTSNonNullExpression } from "./ts-non-null-expression";
import { handleTSTypeAssertion } from "./ts-type-assertion";
import { handleUnaryExpression } from "./unary-expression";
import { handleUpdateExpression } from "./update-expression";
import { handleVariableDeclarator } from "./variable-declarator";

const mapNodeToHandler = makeMapNodeToHandler({ withLogs: false });

export function handleNode(
  context: HandlingContext,
  node: TSESTree.Node | undefined | null
): TraceNode[] {
  const variables = mapNodeToHandler(
    node,
    {
      [AST_NODE_TYPES.ArrayExpression]: handleArrayExpression,
      [AST_NODE_TYPES.ArrowFunctionExpression]: handleArrowFunctionExpression,
      [AST_NODE_TYPES.AssignmentExpression]: handleAssignmentExpression,
      [AST_NODE_TYPES.AwaitExpression]: handleAwaitExpression,
      [AST_NODE_TYPES.BinaryExpression]: handleBinaryExpression,
      [AST_NODE_TYPES.CallExpression]: handleCallExpression,
      [AST_NODE_TYPES.ChainExpression]: handleChainExpression,
      [AST_NODE_TYPES.ClassExpression]: handleClassExpression,
      [AST_NODE_TYPES.ConditionalExpression]: handleConditionalExpression,
      [AST_NODE_TYPES.ForOfStatement]: handleForOfStatement,
      [AST_NODE_TYPES.FunctionDeclaration]: handleFunctionDeclaration,
      [AST_NODE_TYPES.FunctionExpression]: handleFunctionExpression,
      [AST_NODE_TYPES.Identifier]: handleIdentifier,
      [AST_NODE_TYPES.ImportDeclaration]: handleImportDeclaration,
      [AST_NODE_TYPES.ImportDefaultSpecifier]: handleImportDefaultSpecifier,
      [AST_NODE_TYPES.ImportNamespaceSpecifier]: handleImportNamespaceSpecifier,
      [AST_NODE_TYPES.ImportSpecifier]: handleImportSpecifier,
      [AST_NODE_TYPES.Literal]: handleLiteral,
      [AST_NODE_TYPES.LogicalExpression]: handleLogicalExpression,
      [AST_NODE_TYPES.MemberExpression]: handleMemberExpression,
      [AST_NODE_TYPES.NewExpression]: handleNewExpression,
      [AST_NODE_TYPES.ObjectExpression]: handleObjectExpression,
      [AST_NODE_TYPES.Property]: handleProperty,
      [AST_NODE_TYPES.SequenceExpression]: handleSequenceExpression,
      [AST_NODE_TYPES.SpreadElement]: handleSpreadElement,
      [AST_NODE_TYPES.Super]: handleSuper,
      [AST_NODE_TYPES.TaggedTemplateExpression]: handleTaggedTemplateExpression,
      [AST_NODE_TYPES.TemplateElement]: handleTemplateElement,
      [AST_NODE_TYPES.TemplateLiteral]: handleTemplateLiteral,
      [AST_NODE_TYPES.ThisExpression]: handleThisExpression,
      [AST_NODE_TYPES.TSAsExpression]: handleTSAsExpression,
      [AST_NODE_TYPES.TSNonNullExpression]: handleTSNonNullExpression,
      [AST_NODE_TYPES.TSTypeAssertion]: handleTSTypeAssertion,
      [AST_NODE_TYPES.UnaryExpression]: handleUnaryExpression,
      [AST_NODE_TYPES.UpdateExpression]: handleUpdateExpression,
      [AST_NODE_TYPES.VariableDeclarator]: handleVariableDeclarator,
      fallback: (ctx, node) => [
        makeUnresolvedTerminalNode({
          astNodes: [...ctx.connection.astNodes, node],
          reason: `No handler for ${node.type}`,
          connection: ctx.connection,
          meta: ctx.meta,
        }),
      ],
    },
    context
  );

  return variables ?? [];
}
