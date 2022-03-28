import { sanitize } from "dompurify";

const unsafe = await (await fetch("evil.site")).text();

const safe = sanitize(unsafe, { USE_PROFILES: { html: true } });

const modification = `<a href="${safe}" />`;

document.body.innerHTML = modification;

export {};
