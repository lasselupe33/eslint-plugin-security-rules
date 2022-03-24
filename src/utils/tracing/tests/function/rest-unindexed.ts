function myFunc(a: string, ...rest: string[]) {
  return rest;
}

const start = myFunc("aVal", "bVal", "cVal");

export {};
