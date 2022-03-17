export function findReverse<T, O>(
  arr: T[],
  predicate: (element: T) => O | undefined
): O | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    const element = arr[i];

    if (element) {
      const out = predicate(element);

      if (out) {
        return out;
      }
    }
  }
}
