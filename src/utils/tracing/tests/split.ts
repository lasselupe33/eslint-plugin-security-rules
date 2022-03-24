function myFunc() {
  if (Math.random() > 0.5) {
    return "a";
  } else {
    return "b";
  }
}

const start = `${myFunc()}-world`;

export {};
