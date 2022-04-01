import { TSESTree } from "@typescript-eslint/utils";

import { Connection } from "../types/connection";

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
