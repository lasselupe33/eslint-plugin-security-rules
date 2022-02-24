import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

export enum ConnectionTypes {
  MODIFICATION = "modification",
  OVERRIDE = "override",
}

/**
 * A connection is a specification of how a TraceNode is connected to a
 * previous variable.
 */
export type Connection = {
  astNodes: TSESTree.Node[];
  variable?: Scope.Variable | undefined;
  type?: ConnectionTypes | undefined;
};
