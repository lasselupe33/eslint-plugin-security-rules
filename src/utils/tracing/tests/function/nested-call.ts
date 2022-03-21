function first() {
  function second() {
    return "aVal";
  }

  return second();
}

const start = first();

export {};
