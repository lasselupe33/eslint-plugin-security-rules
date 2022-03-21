function callback(arg: string) {
  return `callback-${arg}`;
}

function myFunc(callback: (arg: string) => string) {
  return callback("aVal");
}

const start = myFunc(callback);

export {};
