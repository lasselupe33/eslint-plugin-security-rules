function myFunc(a: string, ...rest: string[]) {
  return rest.join("-");
}

const start = myFunc("aVal", "bVal", "cVal");

export {};
