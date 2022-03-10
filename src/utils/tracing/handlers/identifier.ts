import { TSESTree } from "@typescript-eslint/utils";
import { findVariable } from "@typescript-eslint/utils/dist/ast-utils";

import { HandlingContext } from "../types/context";
import {
  makeConstantTerminalNode,
  makeUnresolvedTerminalNode,
  makeVariableNode,
  TraceNode,
} from "../types/nodes";

export function handleIdentifier(
  ctx: HandlingContext,
  identifier: TSESTree.Identifier
): TraceNode[] {
  if (ctx.meta.forceIdentifierLiteral) {
    return [
      makeConstantTerminalNode({
        astNodes: [...ctx.connection.astNodes, identifier],
        value: identifier.name,
        connection: ctx.connection,
      }),
    ];
  }

  const variable = findVariable(ctx.scope, identifier);

  return variable
    ? [
        makeVariableNode({
          ...ctx,
          astNodes: [...ctx.connection.astNodes, identifier],
          variable,
        }),
      ]
    : [
        makeUnresolvedTerminalNode({
          reason: "Unable to resolve identifier to variable",
          astNodes: [...ctx.connection.astNodes, identifier],
          connection: ctx.connection,
        }),
      ];
}
