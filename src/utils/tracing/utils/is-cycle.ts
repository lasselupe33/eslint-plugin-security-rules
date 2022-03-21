import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { Connection } from "../types/connection";

const MAX_ALLOWED_CYCLES = 1_000;

export function isCycle(connection: Connection) {
  const encounteredMap: WeakMap<Scope.Variable, number> = new WeakMap();
  let currentConnection: Connection | undefined = connection;

  while (currentConnection != null) {
    if (!currentConnection.variable) {
      return false;
    }

    if (
      (encounteredMap.get(currentConnection.variable) ?? 0) > MAX_ALLOWED_CYCLES
    ) {
      return true;
    }

    encounteredMap.set(
      currentConnection.variable,
      (encounteredMap.get(currentConnection.variable) ?? 0) + 1
    );
    currentConnection = currentConnection.prevConnection;
  }

  return false;
}
