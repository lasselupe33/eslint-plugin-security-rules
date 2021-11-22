import jQuery from "jquery";

import { fetchData } from "./api";

async function init() {
  const { html } = await fetchData();

  const tmp = html;
  const cleaned = helloWorld(tmp, "not-used");
  const output = cleaned;

  document.body.innerHTML = output;
}

init();

function helloWorld(input: string, irrelevant: string) {
  const output = input;

  return output;
}
