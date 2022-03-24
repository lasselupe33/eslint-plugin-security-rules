function myFunc() {
  if (Math.random() > 0.5) {
    return "a";
  } else if (Math.random() > 0.1) {
    return "b";
  }

  switch ("hello") {
    case "hello":
      return "c";
  }
}

const start = myFunc();

export {};
