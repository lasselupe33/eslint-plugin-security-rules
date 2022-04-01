import { TSESTree } from "@typescript-eslint/utils";
import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { Connection } from "./connection";

export type ParameterContext = {
  scope: Scope.Scope;
  arguments: TSESTree.Node[];
};

/**
 * Specification of data that will be passed through the entire tracing
 * algorithm, allowing handlers to send additional metadata to future handlers
 */
export type Meta = {
  /**
   * Specification of the currently active arguments that a function call has
   * been performed from.
   */
  parameterContext: WeakMap<TSESTree.Node, ParameterContext>;

  /**
   * Specifies the identifiers that we have traversed on a member that is yet
   * to be resolved to its actual value.
   */
  memberPath: string[];

  /**
   * If set to true, then when handling an identifier we will simply return the
   * literal instead of the resolved variable
   */
  forceIdentifierLiteral?: boolean | undefined;

  forceFollowAllProperties?: boolean;

  callCount: number;

  encounteredSpreadElements: WeakMap<TSESTree.Node, boolean>;

  parserPath: string;
  filePath: string;
};

/**
 * Context available to all handlers when tracing a given node
 */
export type HandlingContext = {
  ruleContext: RuleContext<string, readonly unknown[]>;
  connection: Connection;
  scope: Scope.Scope;
  rootScope: Scope.Scope;
  meta: Meta;
};
