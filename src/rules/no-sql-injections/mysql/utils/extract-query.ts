import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { isIdentifier, isProperty } from "../../../../utils/guards";
import { makeMapNodeToHandler } from "../../../../utils/map-node-to-handler";

const mapNodeToHandler = makeMapNodeToHandler({ disableWarnings: true });

export function extractQuery(
  node: TSESTree.Node | undefined
): TSESTree.Literal | TSESTree.TemplateLiteral | undefined {
  if (!node) {
    return;
  }

  const cases = mapNodeToHandler(node, {
    [AST_NODE_TYPES.Literal]: (ctx, literal) => literal,
    [AST_NODE_TYPES.TemplateLiteral]: (ctx, tliteral) => tliteral,
    [AST_NODE_TYPES.Identifier]: (ctx, identifier) =>
      traceIdentifier(identifier),
    [AST_NODE_TYPES.ObjectExpression]: (ctx, objExp) =>
      extractQuery(handleObjArgs(objExp.properties)),
  });

  return cases;
}

function traceIdentifier(
  node: TSESTree.Identifier
): TSESTree.Literal | undefined {
  // trace the string of a potential identifier
  return undefined;
}

function handleObjArgs(
  node: TSESTree.ObjectLiteralElement[]
): TSESTree.Node | undefined {
  for (const property of node) {
    if (!isProperty(property)) {
      return;
    }
    if (isIdentifier(property.key) && property.key.name === "sql") {
      return property.value;
    }
  }
  return;
}
