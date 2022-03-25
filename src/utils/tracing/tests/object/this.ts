const myObj = {
  a: "aVal",
  getA() {
    return this.a;
  },
};

const start = myObj.getA();

export {};
