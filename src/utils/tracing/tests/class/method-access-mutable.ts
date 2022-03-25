class TestClass {
  public a = "aVal";

  public setA(newA: string) {
    this.a = newA;
  }
}

const testInstance = new TestClass();
testInstance.setA("bVal");
testInstance.a = "cVal";

const start = testInstance.a;

export {};
