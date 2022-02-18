import { TSESTree } from "@typescript-eslint/utils";
import { findVariable } from "@typescript-eslint/utils/dist/ast-utils";

import { HandlingContext, TraceNode } from "../types";

export function handleIdentifier(
  ctx: HandlingContext,
  identifier: TSESTree.Identifier
): TraceNode[] {
  const variable = findVariable(ctx.scope, identifier);

  return variable
    ? [{ ...ctx, variable }]
    : [
        {
          value: identifier.name,
          connection: ctx.connection,
          type: "identifier",
        },
      ];
}
