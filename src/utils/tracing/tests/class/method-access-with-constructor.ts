class TestClass {
  public a = "aVal";

  constructor(input: string) {
    this.a = input;
  }
}

const testInstance = new TestClass("anotherVal");

const start = testInstance.a;

export {};
