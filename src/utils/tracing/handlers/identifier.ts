import { TSESTree } from "@typescript-eslint/utils";
import { findVariable } from "@typescript-eslint/utils/dist/ast-utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import {
  makeConstantTerminalNode,
  makeVariableNode,
  TraceNode,
} from "../types/nodes";

export function handleIdentifier(
  ctx: HandlingContext,
  identifier: TSESTree.Identifier
): TraceNode[] {
  const variable = !ctx.meta.forceIdentifierLiteral
    ? findVariable(ctx.scope, identifier)
    : undefined;

  const nextCtx = deepMerge(ctx, {
    meta: {
      forceIdentifierLiteral: undefined,
    },
  });

  return variable
    ? [makeVariableNode({ ...nextCtx, variable })]
    : [
        makeConstantTerminalNode({
          value: identifier.name,
          connection: ctx.connection,
        }),
      ];
}
