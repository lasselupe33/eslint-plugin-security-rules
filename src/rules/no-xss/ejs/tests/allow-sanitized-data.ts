import { render as someOtherName } from "ejs";
import { sanitize } from "isomorphic-dompurify";

async function asyncFunction() {
  const dataObj = {
    hello: sanitize(await (await fetch("evil")).text(), {
      USE_PROFILES: { html: true },
    }),
  };

  someOtherName("somethin", dataObj);
}

asyncFunction();

export {};
