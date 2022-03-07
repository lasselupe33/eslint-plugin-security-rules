import { CallExpressionArgument } from "@typescript-eslint/types/dist/ast-spec";
import { RuleContext, Scope } from "@typescript-eslint/utils/dist/ts-eslint";

import { Connection } from "./connection";

type Argument = {
  argument: CallExpressionArgument | undefined;
  scope: Scope.Scope;
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
  activeArguments: Record<string, Argument[][]>;

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

  forceFollowObjectProperties?: boolean;
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
