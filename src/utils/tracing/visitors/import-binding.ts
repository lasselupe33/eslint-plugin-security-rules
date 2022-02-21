import { ImportBindingDefinition } from "@typescript-eslint/scope-manager";
import { TSESTree } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import {
  isArrayPattern,
  isCallExpression,
  isVariableDeclarator,
} from "../../ast/guards";
import { deepMerge } from "../../deep-merge";
import { handleNode } from "../handlers/_handle-node";
import { ConnectionTypes } from "../types/connection";
import { HandlingContext } from "../types/context";
import {
  ImportTerminalNode,
  isImportTerminalNode,
  isVariableNode,
  TraceNode,
} from "../types/nodes";

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

function getReactOverrides(
  ctx: HandlingContext,
  variable: Scope.Variable,
  importNode: ImportTerminalNode
): { nextCtx: HandlingContext; nodes: TSESTree.Node[] } | undefined {
  // When encountering a useState() call from react, then we know that the
  // getter may be the value of both the init and the setter.
  // Thus we, in this case, override and add all arguments received by the
  // setter and the initial init.
  if (importNode.imported === "useState" && importNode.source === "react") {
    let declarator = variable.references[0]?.identifier.parent;

    while (declarator && !isVariableDeclarator(declarator)) {
      declarator = declarator.parent;
    }

    // @TODO: Handle useState() if returnType hasnt been mapped to an
    // ArrayPattern
    if (
      !isVariableDeclarator(declarator) ||
      !isArrayPattern(declarator.id) ||
      declarator.id.elements.length !== 2 ||
      !isCallExpression(declarator.init) ||
      !declarator.init.arguments[0]
    ) {
      return;
    }

    const nextCtx = deepMerge(ctx, {
      connection: {
        type: ConnectionTypes.OVERRIDE,
      },
    });

    const setterVariableNode = handleNode(
      nextCtx,
      declarator.id.elements[1]
    )[0];

    if (!isVariableNode(setterVariableNode)) {
      return;
    }

    // Remove references that has a writeExpr (since this will only occur when
    // the setter is defined. Otherwise it will always be a call expression.)
    const relevantReferences = setterVariableNode.variable.references.filter(
      (ref) => !ref.writeExpr
    );

    const relevantArgumentNodes = relevantReferences.flatMap((it) => {
      if (isCallExpression(it.identifier.parent)) {
        return it.identifier.parent.arguments;
      }

      return [];
    });

    return {
      nextCtx,
      nodes: [declarator.init.arguments[0], ...relevantArgumentNodes],
    };
  }
}
