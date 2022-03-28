type MyObj = {
  name: string;
  animals: Record<string, { name: string; age: number }>;
};

let object: MyObj = {
  name: "Ball",
  animals: {
    cat: {
      name: "Mittens",
      age: 3,
    },
    dog: {
      name: "Fido",
      age: 2,
    },
  },
};

if (Math.random() > 0.5) {
  object = {
    name: "Derp",
    animals: {
      ...object.animals,
      turtle: {
        name: "Turtis",
        age: 1,
      },
    },
  };
}

const totalAge =
  (object.animals["cat"]?.age ?? 0) +
  (object.animals["dog"]?.age ?? 0) +
  (object.animals["turtle"]?.age ?? 0);

const start = totalAge;

export {};
