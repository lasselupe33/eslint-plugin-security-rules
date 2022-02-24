import { ImportBindingDefinition } from "@typescript-eslint/scope-manager";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { handleNode } from "../handlers/_handle-node";
import { getReactOverrides } from "../overrides/react";
import { HandlingContext } from "../types/context";
import { isImportTerminalNode, TraceNode } from "../types/nodes";

export function visitImportBinding(
  ctx: HandlingContext,
  variable: Scope.Variable,
  def: ImportBindingDefinition
): TraceNode[] {
  const importNodes = handleNode(ctx, def.node);

  if (isImportTerminalNode(importNodes[0])) {
    const reactOverrides = getReactOverrides(ctx, variable, importNodes[0]);

    if (reactOverrides?.nodes) {
      return reactOverrides.nodes.flatMap((node) =>
        handleNode(reactOverrides.nextCtx, node)
      );
    }
  }

  return importNodes;
}
