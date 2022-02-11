import { TraceNode } from "../types";

export type TraceHandler = [(node: TraceNode) => boolean, () => void];

export function mergeTraceHandlers(
  ...generators: TraceHandler[]
): TraceHandler {
  const onNodeVisited = (node: TraceNode) =>
    generators.map((generator) => generator[0](node)).some((cont) => cont);

  const onFinished = () => generators.map((generator) => generator[1]());

  return [onNodeVisited, onFinished];
}
