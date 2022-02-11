import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import {
  findVariable,
  getInnermostScope,
} from "@typescript-eslint/utils/dist/ast-utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

import { mapNodeToHandler } from "../../../../utils/map-node-to-handler";
import { traceVariable } from "../../../../utils/tracing/_trace-variable";
import { makeTraceDebugger } from "../../../../utils/tracing/debug/print-trace";
import { TraceNode } from "../../../../utils/tracing/types";
import { makeChainGenerator } from "../../../../utils/tracing/utils/generate-chains";
import { mergeTraceHandlers } from "../../../../utils/tracing/utils/merge-trace-handlers";

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

  const chains: TraceNode[][] = [];

  traceVariable(
    {
      context,
      rootScope: rootScope,
      variable: findVariable(rootScope, identifier),
    },
    ...mergeTraceHandlers(makeTraceDebugger(), makeChainGenerator(chains))
  );

  // const isSafe = chains.some((chain) => chain.some(""));

  return true;
}
