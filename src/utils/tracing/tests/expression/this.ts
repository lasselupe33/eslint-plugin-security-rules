class Vegetable {
  type = "Potato";

  constructor(type?: string) {
    if (type) {
      this.type = type;
    }
  }

  getType(): string {
    return this.type;
  }
}

const myVeggie = new Vegetable();

const start = myVeggie.getType();

export {};
