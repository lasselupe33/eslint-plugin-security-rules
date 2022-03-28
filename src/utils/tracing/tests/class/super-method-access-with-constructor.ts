class SuperClass {
  public b = "bVal";

  constructor(input: string) {
    this.b = input;
  }
}

class TestClass extends SuperClass {
  public a = "aVal";

  constructor(input: string) {
    super("superVal");
    this.a = input;
  }
}

const testInstance = new TestClass("anotherVal");

const start = `${testInstance.a}-${testInstance.b}`;

export {};
