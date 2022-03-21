function myFunc(a: string, ...[b, c]: [string, { c: string }]) {
  return `${a}-${b}-${c}`;
}

const start = myFunc("aVal", "bVal", { c: "cVal" });

export {};
