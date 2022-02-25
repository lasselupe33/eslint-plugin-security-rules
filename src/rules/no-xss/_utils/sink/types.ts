export enum IdentifierTypes {
  ANY_ELEMENT = "HTMLElement",
  ANCHOR_ELEMENT = "HTMLAnchorElement",
  SCRIPT_ELEMENT = "HTMLScriptElement",
  BUTTON_ELEMENT = "HTMLButtonElement",
  INPUT_ELEMENT = "HTMLInputElement",

  RANGE = "Range",
}

export enum SinkTypes {
  DOCUMENT = "Document",
  LOCATION = "Location",
  EXECUTION = "Execution",
}

/**
 * A part of a sink is typically identified by its name (e.g. "href"). In case
 * names are not enough to determine matches we can use typescript types
 * instead.
 */
type Identifier = {
  name: string | "__irrelevant__";
  type?: IdentifierTypes;

  /**
   * When set to true then the "name" property will be used as a prefix when
   * matching against candidates.
   */
  isPrefix?: boolean;
}[];

export type RawSink = {
  identifier: Identifier;
  type: SinkTypes;
};

/**
 * Specification of the data structure used to define structures of known XSS
 * sinks.
 */
export type AssignmentExpressionSink = RawSink;
export type CallExpressionSink = RawSink & {
  paramterIndex: number | "any" | "last";
  if?: { paramaterIndex: number; equals: string; isPrefix?: boolean };
};
export type ObjectAssignmentSink = RawSink & {
  property: string;
};
