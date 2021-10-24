export async function fetchData(): Promise<{ html: string }> {
  const response = await fetch("https://evil.site");

  const test = response.json();
  return test;
}
