function* myGenerator(myParam: string) {
  yield "a";
  yield `param-${myParam}`;
}

let str = "";

for (const val of myGenerator("b")) {
  str += val;
}

const start = str;

export {};
