import { AST_NODE_TYPES, TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
  isIdentifier,
  isProperty,
  isTemplateLiteral,
  isVariableDeclarator,
} from "../../../utils/ast/guards";
import { makeMapNodeToHandler } from "../../../utils/ast/map-node-to-handler";
import { traceVariable } from "../../../utils/tracing/_trace-variable";
import { makeTraceCallbacksWithTrace } from "../../../utils/tracing/callbacks/with-current-trace";

const mapNodeToHandler = makeMapNodeToHandler({ disableWarnings: true });

export function extractQuery(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  node: TSESTree.Node | undefined | null,
  objSearchString: string
): TSESTree.Literal | TSESTree.TemplateLiteral | undefined {
  if (!node) {
    return;
  }

  const cases = mapNodeToHandler(
    node,
    {
      [AST_NODE_TYPES.Literal]: (ctx, literal) => literal,
      [AST_NODE_TYPES.TemplateLiteral]: (ctx, tliteral) => tliteral,
      [AST_NODE_TYPES.Identifier]: (ctx, id) =>
        traceIdentifier(ctx, id, objSearchString),
      [AST_NODE_TYPES.ObjectExpression]: (ctx, objExp) =>
        extractQuery(
          ctx,
          handleObjArgs(objExp.properties, objSearchString),
          objSearchString
        ),
      [AST_NODE_TYPES.VariableDeclarator]: (ctx, dec) =>
        extractQuery(ctx, dec.init, objSearchString),
    },
    context
  );

  return cases;
}

function traceIdentifier(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  node: TSESTree.Identifier,
  objSearchString: string
): TSESTree.Literal | TSESTree.TemplateLiteral | undefined {
  // trace the string of a potential identifier
  let maybeNode = undefined;
  traceVariable(
    {
      context,
      node,
    },
    makeTraceCallbacksWithTrace({
      onNodeVisited: (trace, traceNode) => {
        const valueToCheck = traceNode.astNodes[0];

        // Checking if the first node is a variable declaration, before
        // continuing the loop. May need to be removed if specific cases proves
        // otherwise?
        if (!isVariableDeclarator(valueToCheck)) {
          return;
        }

        for (let i = 1; i < traceNode.astNodes.length; i++) {
          if (isTemplateLiteral(traceNode.astNodes[i])) {
            maybeNode = traceNode.astNodes[i];
            return { halt: true };
          }
        }
      },
    })
  );
  return extractQuery(context, maybeNode, objSearchString);
}

function handleObjArgs(
  node: TSESTree.ObjectLiteralElement[],
  objSearchString: string
): TSESTree.Node | undefined {
  for (const property of node) {
    if (!isProperty(property)) {
      return;
    }
    if (isIdentifier(property.key) && property.key.name === objSearchString) {
      return property.value;
    }
  }
  return;
}
