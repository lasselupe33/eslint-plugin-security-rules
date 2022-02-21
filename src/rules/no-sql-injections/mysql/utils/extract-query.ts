import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { isIdentifier, isProperty } from "../../../../utils/ast/guards";
import { makeMapNodeToHandler } from "../../../../utils/ast/map-node-to-handler";
import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../../utils/tracing/callbacks/with-current-trace";
import { printTrace } from "../../../../utils/tracing/utils/printTrace";
import { HandlingContext } from "../_rule";

const mapNodeToHandler = makeMapNodeToHandler({ disableWarnings: true });

export function extractQuery(
  context: HandlingContext,
  node: TSESTree.Node | undefined
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
    },
    context
  );

  return cases;
}

function traceIdentifier(
  context: HandlingContext,
  node: TSESTree.Identifier
): TSESTree.Literal | undefined {
  // trace the string of a potential identifier

  traceVariable(
    {
      context: context.ruleContext,
      rootScope: getInnermostScope(context.ruleContext.getScope(), node),
      node,
    },
    makeTraceCallbacksWithTrace({
      onNodeVisited: (trace, traceNode) => {
        // console.log(traceNode);
        // return { stopFollowingVariable: true }
      },
      onTraceFinished: (trace) => {
        printTrace(trace);
        const finalNode = trace[trace.length - 1];
        // console.log(finalNode);
        // No op
      },
    })
  );
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
