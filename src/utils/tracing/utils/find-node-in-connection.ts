import { TSESTree } from "@typescript-eslint/utils";

import { Connection } from "../types/connection";

/**
 * Finds the first node that matches the predicate.
 */
export function findNodeInConnection<T extends TSESTree.Node>(
  connection: Connection,
  predicate: (node: TSESTree.Node) => node is T
): T | undefined {
  let currConnection: Connection | undefined = connection;

  while (currConnection != null) {
    for (const node of currConnection.astNodes) {
      if (predicate(node)) {
        return node;
      }
    }

    currConnection = currConnection.prevConnection;
  }
}
