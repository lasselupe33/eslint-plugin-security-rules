import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { Scope } from "@typescript-eslint/utils/dist/ts-eslint";

export enum ConnectionTypes {
  MODIFICATION = "modification",
}

/**
 * A connection is a specification of how a TraceNode is connected to a
 * previous variable.
 */
export type Connection = {
  variable?: Scope.Variable | undefined;
  nodeType?: (AST_NODE_TYPES | "Argument") | undefined;
  type?: ConnectionTypes | undefined;
};
