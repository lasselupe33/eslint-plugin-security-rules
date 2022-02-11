import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import {
  findVariable,
  getInnermostScope,
} from "@typescript-eslint/utils/dist/ast-utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import { mapNodeToHandler } from "../../../../utils/map-node-to-handler";
import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { isVariableNode } from "../../../../utils/tracing/types";

type Context = {
  context: RuleContext<string, unknown[]>;
};

export function isSourceSafe(node: TSESTree.Node, ctx: Context): boolean {
  return (
    mapNodeToHandler(
      node,
      {
        [AST_NODE_TYPES.Literal]: () => true,
        [AST_NODE_TYPES.Identifier]: traceToSource,
      },
      ctx
    ) ?? false
  );
}

const SAFE_FUNCTIONS_NAMES = ["safe"];

function traceToSource(
  { context }: Context,
  identifier: TSESTree.Identifier
): boolean {
  const rootScope = getInnermostScope(context.getScope(), identifier);

  let isSafe = false;

  traceVariable(
    {
      context,
      rootScope: rootScope,
      variable: findVariable(rootScope, identifier),
    },
    (node) => {
      if (!isVariableNode(node)) {
        return false;
      }

      if (
        node.variable.defs.some((def) => def.type === "FunctionName") &&
        SAFE_FUNCTIONS_NAMES.includes(node.variable.name)
      ) {
        isSafe = true;
        return true;
      }

      return false;
    }
  );

  return isSafe;
}
