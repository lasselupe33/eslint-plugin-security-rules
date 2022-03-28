async function derp(x: number) {
  const y = await (x + x);
  return y + 2;
}

const start = derp(1);

export {};
