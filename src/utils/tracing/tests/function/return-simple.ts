const world = "world";

function myFunc() {
  return "a" + 34 + `hello-${world}`;
}

const start = myFunc();

export {};
