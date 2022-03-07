// Counts the number of placeholder signs up to the index given
export function countPlaceholders(query: string): number {
  let count = 0;
  // Match on ? or ??
  const regex = /\$/g;
  count += query.match(regex)?.length ?? 0;

  return count;
}
