const prom = Promise.resolve("aVal");

prom.then((a) => {
  const start = a;
});

export {};
