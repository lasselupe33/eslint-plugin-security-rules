import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { isReturnStatement, isYieldExpression } from "../../ast/guards";
import { mapNodeToHandler } from "../../ast/map-node-to-handler";

/**
 * Examines a function body and extracts all relevant ReturnStatements based on
 * whether or not they're reachable from the function itself.
 */
export function getReturnStatements(
  body: Array<TSESTree.Node | null | undefined>
): TSESTree.ReturnStatement[] {
  return body
    .flatMap((it) => {
      if (isReturnStatement(it) || isYieldExpression(it)) {
        return [it];
      }

      return mapNodeToHandler<
        Record<string, unknown>,
        TSESTree.ReturnStatement[]
      >(it, {
        [AST_NODE_TYPES.BlockStatement]: (_, node) =>
          getReturnStatements(node.body),
        [AST_NODE_TYPES.DoWhileStatement]: (_, node) =>
          getReturnStatements([node.body]),
        [AST_NODE_TYPES.ExpressionStatement]: (_, node) =>
          getReturnStatements([node.expression]),
        [AST_NODE_TYPES.ForInStatement]: (_, node) =>
          getReturnStatements([node.body]),
        [AST_NODE_TYPES.ForOfStatement]: (_, node) =>
          getReturnStatements([node.body]),
        [AST_NODE_TYPES.ForStatement]: (_, node) =>
          getReturnStatements([node.body]),
        [AST_NODE_TYPES.IfStatement]: (_, node) =>
          getReturnStatements([node.consequent, node.alternate]),
        [AST_NODE_TYPES.LabeledStatement]: (_, node) =>
          getReturnStatements([node.body]),
        [AST_NODE_TYPES.SwitchStatement]: (_, node) =>
          getReturnStatements(
            node.cases.flatMap((switchCase) => switchCase.consequent)
          ),
        [AST_NODE_TYPES.TryStatement]: (_, node) =>
          getReturnStatements([node.block, node.handler?.body, node.finalizer]),
        [AST_NODE_TYPES.TryStatement]: (_, node) =>
          getReturnStatements([node.block, node.handler?.body, node.finalizer]),
        [AST_NODE_TYPES.WhileStatement]: (_, node) =>
          getReturnStatements([node.body]),
        [AST_NODE_TYPES.WithStatement]: (_, node) =>
          getReturnStatements([node.body]),
        fallback: () => [],
      });
    })
    .filter((it): it is TSESTree.ReturnStatement => !!it);
}
