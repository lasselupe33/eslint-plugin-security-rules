import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { mapNodeToHandler } from "../../../../utils/map-node-to-handler";
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
        // We need variable trace to make sure that the identifier is not
        // escaped previously.
        isEscapeFunction(ctx, identifier),
      [AST_NODE_TYPES.MemberExpression]: (ctx, memExp) =>
        isEscapedExpression(ctx, memExp.property),
      [AST_NODE_TYPES.CallExpression]: (ctx, callExp) =>
        isEscapedExpression(ctx, callExp.callee),
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
  return false;
}
