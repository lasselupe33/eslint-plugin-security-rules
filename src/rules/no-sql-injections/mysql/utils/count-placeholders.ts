// Counts the number of placeholder signs up to the index given
export function countPlaceholders(query?: string): number {
  if (!query) {
    return 0;
  }

  // Match on ? or ??
  const regex = /(?<!\?)\?\?(?!\?) | (?<!\?)\?(?!\?)/g;

  return query.match(regex)?.length ?? 0;
}
