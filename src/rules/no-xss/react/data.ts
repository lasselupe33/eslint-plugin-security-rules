import {
  AssignmentExpressionSink,
  ObjectAssignmentSink,
  SinkTypes,
} from "../_utils/sink/types";

export const ASSIGNMENT_SINKS: (
  | AssignmentExpressionSink
  | ObjectAssignmentSink
)[] = [
  {
    type: SinkTypes.DOCUMENT,
    identifier: [{ name: "href" }],
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [{ name: "src" }],
  },
  {
    type: SinkTypes.DOCUMENT,
    identifier: [{ name: "dangerouslySetInnerHTML" }],
    property: "__html",
  },
];
