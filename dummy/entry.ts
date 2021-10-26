import { fetchData } from "./api";

async function init() {
  const { html } = await fetchData();

  const tmp = html;
  const cleaned = helloWorld(tmp, "not-used");
  const tmp2 = cleaned;

  document.body.innerHTML = tmp2;
}

init();

function helloWorld(input: string, irrelevant: string) {
  const output = input;

  return output;
}
