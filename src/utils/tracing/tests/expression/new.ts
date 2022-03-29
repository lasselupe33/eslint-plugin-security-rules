class Car {
  model: string;
  color: string;
  year: number;

  constructor(model: string, color: string, year: number) {
    this.model = model;
    this.color = color;
    this.year = year;
  }

  alwaysFalse(): boolean {
    return false;
  }
}

const car = new Car("Ford", "red", 2020);

const start = car.alwaysFalse();

export {};
