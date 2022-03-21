function myFunc(a: string, ...rest: string[]) {
  return rest[1];
}

const start = myFunc("aVal", "bVal", "cVal");

export {};
