class SuperClass {
  public b = "bVal";
}

class TestClass extends SuperClass {
  public a = "aVal";

  public getB() {
    return super.b;
  }
}

const testInstance = new TestClass();

const start = `${testInstance.a}-${testInstance.getB()}`;

export {};
