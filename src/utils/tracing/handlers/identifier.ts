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

const reservedGlobals = new Set(["__dirname", "__filename"]);
const reservedObjects: Record<string, string[]> = {
  path: ["sep", "delimiter"],
};

export function handleIdentifier(
  ctx: HandlingContext,
  identifier: TSESTree.Identifier
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, identifier],
    },
  });

  if (
    ctx.meta.forceIdentifierLiteral ||
    reservedGlobals.has(identifier.name) ||
    isReservedObjectIdentifier(ctx, identifier)
  ) {
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

function isReservedObjectIdentifier(
  ctx: HandlingContext,
  identifier: TSESTree.Identifier
): boolean {
  return (
    ctx.meta.memberPath.length > 0 &&
    Object.hasOwn(reservedObjects, identifier.name) &&
    !!reservedObjects[identifier.name]?.includes(
      ctx.meta.memberPath[ctx.meta.memberPath.length - 1] ?? ""
    )
  );
}
