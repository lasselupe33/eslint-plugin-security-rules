import {
  AssignmentExpressionSink,
  CallExpressionSink,
  IdentifierTypes,
  SinkTypes,
} from "../_utils/sink/types";

export const ASSIGNMENT_EXPRESSION_SINKS: AssignmentExpressionSink[] = [
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
      { name: "__irrelevant__", type: IdentifierTypes.ANY_ELEMENT },
      { name: "src" },
    ],
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.ANY_ELEMENT },
      { name: "href" },
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
    type: SinkTypes.EXECUTION,
    identifier: [{ name: "document" }, { name: "execCommand" }],
    paramterIndex: 2,
    if: { paramaterIndex: 0, equals: "inserthtml" },
  },
  {
    type: SinkTypes.EXECUTION,
    identifier: [{ name: "vm" }, { name: "runInNewContext" }],
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
      { name: "insertAdjacentHTML" },
    ],
    paramterIndex: 1,
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [
      { name: "__irrelevant__", type: IdentifierTypes.RANGE },
      { name: "createContextualFragment" },
    ],
    paramterIndex: 0,
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

export const NEW_EXPRESSION_SINKS: CallExpressionSink[] = [
  {
    type: SinkTypes.EXECUTION,
    identifier: [{ name: "Function" }],
    paramterIndex: "last",
  },
];
