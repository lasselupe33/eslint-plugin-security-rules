import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { getInnermostScope } from "@typescript-eslint/utils/dist/ast-utils";

import { mapNodeToHandler } from "../../../../utils/ast/map-node-to-handler";
import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../../utils/tracing/callbacks/with-current-trace";
import { printTrace } from "../../../../utils/tracing/utils/printTrace";
import { getNodeModule } from "../../../../utils/types/get-node-module";
import { getTypeProgram } from "../../../../utils/types/get-type-program";
import { HandlingContext } from "../_rule";

export function isEscapedExpression(
  context: HandlingContext,
  node: TSESTree.Node
): boolean | undefined {
  const cases = mapNodeToHandler(
    node,
    {
      [AST_NODE_TYPES.Identifier]: (ctx, identifier) =>
        isEscapeFunction(ctx, identifier),
      [AST_NODE_TYPES.MemberExpression]: (ctx, memExp) =>
        isEscapedExpression(ctx, memExp.property),
      [AST_NODE_TYPES.CallExpression]: (ctx, callExp) =>
        isEscapedExpression(ctx, callExp.callee),
      [AST_NODE_TYPES.TemplateElement]: (ctx, callExp) => undefined,
    },
    context
  );

  return cases;
}

function isEscapeFunction(
  context: HandlingContext,
  node: TSESTree.Identifier
): boolean {
  if (node.name === "escape") {
    const typeProgram = getTypeProgram(context.ruleContext);
    if (typeProgram) {
      const { fullyQualifiedName } = getNodeModule(typeProgram, node);
      if (!fullyQualifiedName?.includes("@types/mysql/index")) {
        return false;
      }
    }
    return true;
  }
  return isSourceEscaped(context, node);
}

export function isSourceEscaped(
  context: HandlingContext,
  node: TSESTree.Node | undefined
): boolean {
  if (!node) {
    return true;
  }

  const isSafe = false;
  const isCurrentTraceSafelySanitzed = false;
  /**
   * Iterates through traces to determine whether or not the function has been
   * escaped.
   *
   * We check this by determining if the escape method has been called BEFORE
   * any modifications in the trace. (Since escaping may be rendered useless
   * after any modifications)
   */
  traceVariable(
    {
      context: context.ruleContext,
      rootScope: getInnermostScope(context.ruleContext.getScope(), node),
      node,
    },
    makeTraceCallbacksWithTrace({
      onNodeVisited: (trace, traceNode) => {
        // No op
      },
      onTraceFinished: (trace) => {
        printTrace(trace);
      },
    })
  );

  return isSafe;
}
