import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

export function mapNodeToHandler<
  Context extends Record<string, unknown> | undefined,
  ReturnType
>(
  node: TSESTree.Node | null | undefined,
  callbacks: {
    [Type in AST_NODE_TYPES]?: (
      ctx: Context,
      node: TSESTree.Node & { type: Type }
    ) => ReturnType;
  },
  ctx?: Context
): ReturnType | undefined {
  if (!node) {
    return;
  }

  const callback = callbacks[node.type];

  if (!callback) {
    console.warn(
      `mapNodeToHandler(${node.type}): No handler associated to type.`,
      node
    );
  }

  // @ts-expect-error Typings are not ideal for the internal implementation of
  // this helper, however when used externally we get what we expect.
  return callback?.(ctx, node) as ReturnType;
}
