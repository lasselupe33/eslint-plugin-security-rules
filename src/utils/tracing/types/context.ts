import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { ParameterToArgumentMap } from "../parameter-to-argument";

import { Connection } from "./connection";

/**
 * Specification of data that will be passed through the entire tracing
 * algorithm, allowing handlers to send additional metadata to future handlers
 */
export type Meta = {
  /**
   * Mapping between parameters and arguments which is useful when entering
   * and exiting functions, where we need to ensure we exit back to the
   * correct argument.
   */
  parameterToArgumentMap: ParameterToArgumentMap | undefined;

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
};

/**
 * Context available to all handlers when tracing a given node
 */
export type HandlingContext = {
  ruleContext: RuleContext<string, unknown[]>;
  connection: Connection;
  scope: Scope.Scope;
  meta: Meta;
};
