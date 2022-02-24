import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import {
  getInnermostScope,
  isVariableDeclarator,
} from "@typescript-eslint/utils/dist/ast-utils";
import { isTemplateLiteral } from "typescript";

import { isIdentifier, isProperty } from "../../../../utils/ast/guards";
import { makeMapNodeToHandler } from "../../../../utils/ast/map-node-to-handler";
import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../../utils/tracing/callbacks/with-current-trace";
import { printTrace } from "../../../../utils/tracing/utils/print-trace";
import { HandlingContext } from "../_rule";

const mapNodeToHandler = makeMapNodeToHandler({ disableWarnings: true });

export function extractQuery(
  context: HandlingContext,
  node: TSESTree.Node | undefined | null
): TSESTree.Literal | TSESTree.TemplateLiteral | undefined {
  if (!node) {
    return;
  }

  const cases = mapNodeToHandler(
    node,
    {
      [AST_NODE_TYPES.Literal]: (ctx, literal) => literal,
      [AST_NODE_TYPES.TemplateLiteral]: (ctx, tliteral) => tliteral,
      [AST_NODE_TYPES.Identifier]: (ctx, id) => traceIdentifier(ctx, id),
      [AST_NODE_TYPES.ObjectExpression]: (ctx, objExp) =>
        extractQuery(ctx, handleObjArgs(objExp.properties)),
      [AST_NODE_TYPES.VariableDeclarator]: (ctx, dec) =>
        extractQuery(ctx, dec.init),
    },
    context
  );

  return cases;
}

function traceIdentifier(
  context: HandlingContext,
  node: TSESTree.Identifier
): TSESTree.Literal | TSESTree.TemplateLiteral | undefined {
  // trace the string of a potential identifier
  const maybeNode = undefined;
  traceVariable(
    {
      context: context.ruleContext,
      rootScope: getInnermostScope(context.ruleContext.getScope(), node),
      node,
    },
    makeTraceCallbacksWithTrace({
      onNodeVisited: (trace, traceNode) => {
        // if (traceNode.connection?.nodeType === "TemplateLiteral") {
        //   maybeNode = traceNode.connection.variable?.defs[0]?.node;
        //   return { stopFollowingVariable: true };
        // }
      },
    })
  );
  return extractQuery(context, maybeNode);
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
