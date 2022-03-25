class TestClass {
  private a = "aVal";
  private b = "bVal";

  public getA() {
    return this.a;
  }

  public getB = () => {
    return this.b;
  };
}

const testInstance = new TestClass();

const start = `${testInstance.getA()}-${testInstance.getB()}`;

export {};
