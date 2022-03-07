import { TSESTree } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

export enum ConnectionFlags {
  APPEND = "append",
  REASSIGN = "reassign",
  MODIFICATION = "modification",
  OVERRIDE = "override",
}

/**
 * A connection is a specification of how a TraceNode is connected to a
 * previous variable.
 */
export type Connection = {
  astNodes: TSESTree.Node[];
  flags: Set<ConnectionFlags>;
  variable?: Scope.Variable | undefined;
};
