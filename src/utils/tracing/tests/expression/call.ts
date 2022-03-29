function sum(a: number, b: number, ...rest: number[]): number {
  const result = rest.reduce((acc, cur) => acc + cur, 0);

  return result;
}

const TestArray = [1, 2, 3, 4, 5];

const start = sum(6, 7, ...TestArray);

export {};
