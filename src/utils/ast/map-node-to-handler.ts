import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { warnOnce } from "../warn-once";

export function makeMapNodeToHandler(
  {
    disableWarnings,
    withLogs,
  }: { disableWarnings?: boolean; withLogs?: boolean } = {
    disableWarnings: false,
    withLogs: false,
  }
) {
  return function mapNodeToHandler<
    Context extends Record<string, unknown>,
    ReturnType
  >(
    node: TSESTree.Node | null | undefined,
    callbacks: {
      fallback?: (ctx: Context, node: TSESTree.Node) => ReturnType;
    } & {
      [Type in AST_NODE_TYPES]?: (
        ctx: Context,
        node: TSESTree.Node & { type: Type }
      ) => ReturnType;
    },
    ctx: Context | undefined = undefined
  ): ReturnType | undefined {
    if (!node) {
      return;
    }

    const callback = callbacks[node.type];

    if (!callback && callbacks["fallback"]) {
      // @ts-expect-error It is okay for the context to be undefined
      return callbacks["fallback"](ctx, node);
    }

    if (!callback && !disableWarnings) {
      warnOnce(() => [
        `mapNodeToHandler(%s): No handler associated to type.`,
        node.type,
      ]);
    }

    if (withLogs) {
      console.warn("Handling ", node.type);
    }

    // @ts-expect-error Typings are not ideal for the internal implementation of
    // this helper, however when used externally we get what we expect.
    return callback?.(ctx, node) as ReturnType;
  };
}

export const mapNodeToHandler = makeMapNodeToHandler();
