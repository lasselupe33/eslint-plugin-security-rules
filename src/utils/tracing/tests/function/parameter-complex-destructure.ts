function myFunc({ a }: { a: { b: { c: [{ d: string }] } } }) {
  return a.b.c[0].d;
}

const start = myFunc({ a: { b: { c: [{ d: "dVal" }] } } });

export {};
