export async function fetchData(): Promise<{ html: string }> {
  const response = await fetch("https://evil.site");

  const second = response.json();

  const test = second;
  return test;
}
