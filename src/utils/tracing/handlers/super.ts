import { Scope } from "@typescript-eslint/scope-manager";
import { TSESTree } from "@typescript-eslint/utils";

import { isClassDeclaration } from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { HandlingContext } from "../types/context";
import { makeUnresolvedTerminalNode, TraceNode } from "../types/nodes";

import { handleNode } from "./_handle-node";

export function handleSuper(
  ctx: HandlingContext,
  superNode: TSESTree.Super
): TraceNode[] {
  const nextCtx = deepMerge(ctx, {
    connection: {
      astNodes: [...ctx.connection.astNodes, superNode],
    },
  });

  const classDeclaration = getNearestClassDeclaration(ctx);

  if (!classDeclaration) {
    return [
      makeUnresolvedTerminalNode({
        reason: "Unable to resolve classDeclaration",
        astNodes: nextCtx.connection.astNodes,
        connection: nextCtx.connection,
        meta: nextCtx.meta,
      }),
    ];
  }

  return handleNode(nextCtx, classDeclaration.superClass);
}

function getNearestClassDeclaration(
  ctx: HandlingContext
): TSESTree.ClassDeclaration | undefined {
  let currentScope: Scope | null = ctx.scope;

  while (currentScope !== null) {
    if (isClassDeclaration(currentScope.block)) {
      return currentScope.block;
    }

    currentScope = currentScope.upper;
  }
}
