import { TSESTree } from "@typescript-eslint/utils";
import { findVariable } from "@typescript-eslint/utils/dist/ast-utils";

import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import {
  makeConstantTerminalNode,
  makeUnresolvedTerminalNode,
  makeVariableNode,
  TraceNode,
} from "../types/nodes";

const reservedSet = new Set(["__dirname", "__filename"]);

export function handleIdentifier(
  ctx: HandlingContext,
  identifier: TSESTree.Identifier
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, identifier],
    },
  });

  if (ctx.meta.forceIdentifierLiteral || reservedSet.has(identifier.name)) {
    return [
      makeConstantTerminalNode({
        astNodes: nextCtx.connection.astNodes,
        value: identifier.name,
        connection: nextCtx.connection,
        meta: nextCtx.meta,
      }),
    ];
  }

  const variable = findVariable(nextCtx.scope, identifier);

  return variable
    ? [
        makeVariableNode({
          ...nextCtx,
          astNodes: nextCtx.connection.astNodes,
          variable,
        }),
      ]
    : [
        makeUnresolvedTerminalNode({
          reason: "Unable to resolve identifier to variable",
          astNodes: nextCtx.connection.astNodes,
          connection: nextCtx.connection,
          meta: nextCtx.meta,
        }),
      ];
}
