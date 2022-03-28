export const a = "aVal",
  b = "bVal",
  c = "cVal";

export function myFunc(a: string) {
  return `myFunc-${a}`;
}

export class MyClass {
  public a = "classVal";

  constructor(input: string) {
    this.a = input;
  }
}
