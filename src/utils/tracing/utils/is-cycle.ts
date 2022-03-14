import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { Connection } from "../types/connection";

export function isCycle(connection: Connection) {
  const encounteredMap: WeakMap<Scope.Variable, boolean> = new WeakMap();
  let currentConnection: Connection | undefined = connection;

  while (currentConnection != null) {
    if (!currentConnection.variable) {
      return false;
    }

    if (encounteredMap.has(currentConnection.variable)) {
      return true;
    }

    encounteredMap.set(currentConnection.variable, true);
    currentConnection = currentConnection.prevConnection;
  }

  return false;
}
