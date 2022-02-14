import { Node, AST_NODE_TYPES } from "@typescript-eslint/types/dist/ast-spec";

export function makeMapNodeToHandler(
  { disableWarnings }: { disableWarnings: boolean } = { disableWarnings: false }
) {
  return function mapNodeToHandler<
    Context extends Record<string, unknown>,
    ReturnType
  >(
    node: Node | null | undefined,
    callbacks: {
      fallback?: (ctx: Context, node: Node) => ReturnType;
    } & {
      [Type in AST_NODE_TYPES]?: (
        ctx: Context,
        node: Node & { type: Type }
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
      console.warn(
        `mapNodeToHandler(${node.type}): No handler associated to type.`,
        node
      );
    }

    // @ts-expect-error Typings are not ideal for the internal implementation of
    // this helper, however when used externally we get what we expect.
    return callback?.(ctx, node) as ReturnType;
  };
}

export const mapNodeToHandler = makeMapNodeToHandler();
