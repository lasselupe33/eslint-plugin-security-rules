import { TSESTree } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

export enum ConnectionFlags {
  APPEND = "append",
  REASSIGN = "reassign",
  MODIFICATION = "modification",
  SPLIT = "split",
  OVERRIDE = "override",
  CALL = "call",
}

/**
 * A connection is a specification of how a TraceNode is connected to a
 * previous variable.
 */
export type Connection = {
  astNodes: TSESTree.Node[];
  flags: Set<ConnectionFlags>;
  variable?: Scope.Variable | undefined;
  prevConnection: Connection | undefined;
};
