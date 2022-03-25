class TestClass {
  public static a = "aVal";

  public static setA(newA: string) {
    this.a = newA;
  }
}

TestClass.setA("bVal");
TestClass.a = "cVal";

const start = TestClass.a;

export {};
