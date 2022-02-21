export function repeat<T>(it: T, times: number): T[] {
  return new Array(times).fill(it) as T[];
}
