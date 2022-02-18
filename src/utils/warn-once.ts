import { generateVariableId } from "./generate-variable-id";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HAS_WARNED = new Set<string>();

export function warnOnce<TArgs extends unknown[]>(
  cb: (...args: TArgs) => unknown[],
  ...args: TArgs
): void {
  if (process.env["NODE_ENV"] === "production") {
    return;
  }

  const key = args.reduce<string>(
    (acc, arg) => `${acc}&${String(arg)}`,
    generateVariableId(cb)
  );

  if (!HAS_WARNED.has(key)) {
    HAS_WARNED.add(key);

    console.warn(...cb(...args));
  }
}
