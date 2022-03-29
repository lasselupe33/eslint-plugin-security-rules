function a(x: number) {
  return "I have " + x + " cookies!";
}

function b(n: number) {
  return a(n);
}

function c(z: number) {
  return b(z);
}

const start = c(10);

export {};
