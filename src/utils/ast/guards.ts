// Imported from
// https://github.com/testing-library/eslint-plugin-testing-library/blob/main/lib/node-utils/is-node-of-type.ts

import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

const isNodeOfType =
  <NodeType extends AST_NODE_TYPES>(nodeType: NodeType) =>
  (
    node: TSESTree.Node | null | undefined
  ): node is TSESTree.Node & { type: NodeType } =>
    node?.type === nodeType;

export const isIdentifier = isNodeOfType(AST_NODE_TYPES.Identifier);
export const isTaggedTemplateExpression = isNodeOfType(
  AST_NODE_TYPES.TaggedTemplateExpression
);
export const isExportNamedDeclaration = isNodeOfType(
  AST_NODE_TYPES.ExportNamedDeclaration
);
export const isExportDefaultDeclaration = isNodeOfType(
  AST_NODE_TYPES.ExportDefaultDeclaration
);
export const isExportAllDeclaration = isNodeOfType(
  AST_NODE_TYPES.ExportAllDeclaration
);
export const isArrayExpression = isNodeOfType(AST_NODE_TYPES.ArrayExpression);
export const isArrowFunctionExpression = isNodeOfType(
  AST_NODE_TYPES.ArrowFunctionExpression
);
export const isBlockStatement = isNodeOfType(AST_NODE_TYPES.BlockStatement);
export const isCallExpression = isNodeOfType(AST_NODE_TYPES.CallExpression);
export const isRestElement = isNodeOfType(AST_NODE_TYPES.RestElement);
export const isExpressionStatement = isNodeOfType(
  AST_NODE_TYPES.ExpressionStatement
);
export const isVariableDeclaration = isNodeOfType(
  AST_NODE_TYPES.VariableDeclaration
);
export const isVariableDeclarator = isNodeOfType(
  AST_NODE_TYPES.VariableDeclarator
);
export const isAssignmentExpression = isNodeOfType(
  AST_NODE_TYPES.AssignmentExpression
);
export const isSequenceExpression = isNodeOfType(
  AST_NODE_TYPES.SequenceExpression
);
export const isImportDeclaration = isNodeOfType(
  AST_NODE_TYPES.ImportDeclaration
);
export const isImportDefaultSpecifier = isNodeOfType(
  AST_NODE_TYPES.ImportDefaultSpecifier
);
export const isImportNamespaceSpecifier = isNodeOfType(
  AST_NODE_TYPES.ImportNamespaceSpecifier
);
export const isImportSpecifier = isNodeOfType(AST_NODE_TYPES.ImportSpecifier);
export const isExportSpecifier = isNodeOfType(AST_NODE_TYPES.ExportSpecifier);
export const isSpreadElement = isNodeOfType(AST_NODE_TYPES.SpreadElement);
export const isJSXAttribute = isNodeOfType(AST_NODE_TYPES.JSXAttribute);
export const isLiteral = isNodeOfType(AST_NODE_TYPES.Literal);
export const isMemberExpression = isNodeOfType(AST_NODE_TYPES.MemberExpression);
export const isNewExpression = isNodeOfType(AST_NODE_TYPES.NewExpression);
export const isObjectExpression = isNodeOfType(AST_NODE_TYPES.ObjectExpression);
export const isObjectPattern = isNodeOfType(AST_NODE_TYPES.ObjectPattern);
export const isProperty = isNodeOfType(AST_NODE_TYPES.Property);
export const isMethodDefinition = isNodeOfType(AST_NODE_TYPES.MethodDefinition);
export const isReturnStatement = isNodeOfType(AST_NODE_TYPES.ReturnStatement);
export const isYieldExpression = isNodeOfType(AST_NODE_TYPES.YieldExpression);
export const isFunctionExpression = isNodeOfType(
  AST_NODE_TYPES.FunctionExpression
);
export const isFunctionDeclaration = isNodeOfType(
  AST_NODE_TYPES.FunctionDeclaration
);
export const isClassDeclaration = isNodeOfType(AST_NODE_TYPES.ClassDeclaration);
export const isPropertyDefinition = isNodeOfType(
  AST_NODE_TYPES.PropertyDefinition
);
export const isProgram = isNodeOfType(AST_NODE_TYPES.Program);
export const isTSTypeReference = isNodeOfType(AST_NODE_TYPES.TSTypeReference);
export const isTSTypeAnnotation = isNodeOfType(AST_NODE_TYPES.TSTypeAnnotation);
export const isJSXExpressionContainer = isNodeOfType(
  AST_NODE_TYPES.JSXExpressionContainer
);
export const isJSXEmptyExpression = isNodeOfType(
  AST_NODE_TYPES.JSXEmptyExpression
);
export const isJSXIdentifier = isNodeOfType(AST_NODE_TYPES.JSXIdentifier);
export const isJSXNamespacedName = isNodeOfType(
  AST_NODE_TYPES.JSXNamespacedName
);

// Custom guards

export const isArrayPattern = isNodeOfType(AST_NODE_TYPES.ArrayPattern);

export const isParameter = (
  def?: Scope.Definition | null
): def is Scope.Definition & { type: typeof Scope.DefinitionType.Parameter } =>
  def?.type === Scope.DefinitionType.Parameter;

export const isImportBinding = (
  def?: Scope.Definition | null
): def is Scope.Definition & {
  type: typeof Scope.DefinitionType.ImportBinding;
} => def?.type === Scope.DefinitionType.ImportBinding;

export const isFunctionName = (
  def?: Scope.Definition | null
): def is Scope.Definition & {
  type: typeof Scope.DefinitionType.FunctionName;
} => def?.type === Scope.DefinitionType.FunctionName;

export const isClassName = (
  def?: Scope.Definition | null
): def is Scope.Definition & {
  type: typeof Scope.DefinitionType.ClassName;
} => def?.type === Scope.DefinitionType.ClassName;

// Basic guards

export function isPrimitive(
  value: unknown
): value is string | number | boolean | undefined | null {
  return (
    !value ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean"
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

export function isSymbol(value: unknown): value is symbol {
  return typeof value === "symbol";
}

// Literals

export const isTemplateLiteral = isNodeOfType(AST_NODE_TYPES.TemplateLiteral);
export const isTemplateElement = isNodeOfType(AST_NODE_TYPES.TemplateElement);

export function isBigIntLiteral(
  literal: TSESTree.Literal
): literal is TSESTree.BigIntLiteral {
  return typeof literal.value === "bigint";
}

export function isBooleanLiteral(
  literal: TSESTree.Literal
): literal is TSESTree.BooleanLiteral {
  return typeof literal.value === "boolean";
}

export function isNullLiteral(
  literal: TSESTree.Literal
): literal is TSESTree.NullLiteral {
  return typeof literal.value === null;
}

export function isNumberLiteral(
  literal: TSESTree.Literal
): literal is TSESTree.NumberLiteral {
  return typeof literal.value === "number";
}

/* export function isRegExpLiteral(
  literal: TSESTree.Literal
): literal is TSESTree.RegExpLiteral {
  return typeof
}*/

export function isStringLiteral(
  literal: TSESTree.Literal
): literal is TSESTree.StringLiteral {
  return typeof literal.value === "string";
}
