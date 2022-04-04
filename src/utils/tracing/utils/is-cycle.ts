import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { Connection } from "../types/connection";

const MAX_ALLOWED_CYCLES = 100;

export function isCycle(
  encounteredMap: WeakMap<Scope.Variable, number>,
  maxCycles = MAX_ALLOWED_CYCLES,
  connection: Connection
) {
  let currentConnection: Connection | undefined = connection;

  while (currentConnection != null) {
    if (!currentConnection.variable) {
      return false;
    }

    if ((encounteredMap.get(currentConnection.variable) ?? 0) > maxCycles) {
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
