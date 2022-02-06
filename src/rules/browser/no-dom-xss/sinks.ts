export enum IdentifierTypes {
  ANY_ELEMENT = "HTMLElement",
  SCRIPT_ELEMENT = "HTMLScriptElement",
  BUTTON_ELEMENT = "HTMLButtonElement",
  INPUT_ELEMENT = "HTMLInputElement",
}

export enum SinkTypes {
  DOCUMENT = "document",
  LOCATION = "location",
  EXECUTION = "execution",
}

type Identifier = {
  isPrefix?: boolean;
  name: string | "__irrelevant__";
  type?: IdentifierTypes;
}[];

export type RawSink = {
  identifier: Identifier;
  type: SinkTypes;
};

export type AssignmentExpressionSink = RawSink;
export type CallExpressionSink = RawSink & {
  paramterIndex: number | "any" | "last";
  if?: { paramaterIndex: number; equals: string; isPrefix?: boolean };
};
export type NewExpressionSink = RawSink & {
  paramterIndex: number | "any" | "last";
};

export const ASSIGNMENT_EXPRESSION_SINKS: AssignmentExpressionSink[] = [
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.SCRIPT_ELEMENT },
      { name: "src" },
    ],
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.SCRIPT_ELEMENT },
      { name: "text" },
    ],
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.SCRIPT_ELEMENT },
      { name: "textContent" },
    ],
  },

  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.BUTTON_ELEMENT },
      { name: "value" },
    ],
  },

  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.ANY_ELEMENT },
      { name: "innerHTML" },
    ],
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.ANY_ELEMENT },
      { name: "outerHTML" },
    ],
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.ANY_ELEMENT },
      { name: "on", isPrefix: true },
    ],
  },

  { type: SinkTypes.LOCATION, identifier: [{ name: "location" }] },
  {
    type: SinkTypes.LOCATION,
    identifier: [{ name: "location" }, { name: "href" }],
  },
  {
    type: SinkTypes.LOCATION,
    identifier: [{ name: "location" }, { name: "pathname" }],
  },
  {
    type: SinkTypes.LOCATION,
    identifier: [{ name: "location" }, { name: "search" }],
  },
  {
    type: SinkTypes.LOCATION,
    identifier: [{ name: "location" }, { name: "protocol" }],
  },
  {
    type: SinkTypes.LOCATION,
    identifier: [{ name: "location" }, { name: "hostname" }],
  },
];

export const CALL_EXPRESSION_SINKS: CallExpressionSink[] = [
  {
    type: SinkTypes.EXECUTION,
    identifier: [{ name: "eval" }],
    paramterIndex: 0,
  },
  {
    type: SinkTypes.EXECUTION,
    identifier: [{ name: "setTimeout" }],
    paramterIndex: 0,
  },
  {
    type: SinkTypes.EXECUTION,
    identifier: [{ name: "setInterval" }],
    paramterIndex: 0,
  },

  {
    type: SinkTypes.DOCUMENT,
    identifier: [{ name: "document" }, { name: "write" }],
    paramterIndex: "any",
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [{ name: "document" }, { name: "writeln" }],
    paramterIndex: "any",
  },

  {
    type: SinkTypes.LOCATION,
    identifier: [{ name: "location" }, { name: "assign" }],
    paramterIndex: 0,
  },
  {
    type: SinkTypes.LOCATION,
    identifier: [{ name: "location" }, { name: "replace" }],
    paramterIndex: 0,
  },

  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.ANY_ELEMENT },
      { name: "insertAdjecentHTML" },
    ],
    paramterIndex: 1,
  },

  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.ANY_ELEMENT },
      { name: "setAttribute" },
    ],
    paramterIndex: 1,
    if: { paramaterIndex: 0, equals: "href" },
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.ANY_ELEMENT },
      { name: "setAttribute" },
    ],
    paramterIndex: 1,
    if: { paramaterIndex: 0, equals: "src" },
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.ANY_ELEMENT },
      { name: "setAttribute" },
    ],
    paramterIndex: 1,
    if: { paramaterIndex: 0, equals: "on", isPrefix: true },
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.SCRIPT_ELEMENT },
      { name: "setAttribute" },
    ],
    paramterIndex: 1,
    if: { paramaterIndex: 0, equals: "text" },
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.SCRIPT_ELEMENT },
      { name: "setAttribute" },
    ],
    paramterIndex: 1,
    if: { paramaterIndex: 0, equals: "innerText" },
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.INPUT_ELEMENT },
      { name: "setAttribute" },
    ],
    paramterIndex: 1,
    if: { paramaterIndex: 0, equals: "value" },
  },
];

export const NEW_EXPRESSION_SINKS: NewExpressionSink[] = [
  {
    type: SinkTypes.EXECUTION,
    identifier: [{ name: "Function" }],
    paramterIndex: "last",
  },
];