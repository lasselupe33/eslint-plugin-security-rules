import { render as someOtherName } from "ejs";

async function asyncFunction() {
  const dataObj = {
    hello: await (await fetch("evil")).text(),
  };

  someOtherName("somethin", dataObj);
}

asyncFunction();

export {};
