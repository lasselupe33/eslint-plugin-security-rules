import { fetchData } from "./api";

async function init() {
  const { html } = await fetchData();

  const cleaned = html;

  document.body.innerHTML = cleaned;
}
