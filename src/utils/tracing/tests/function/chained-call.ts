const myCall = (a: string) => (b: string) => `${a}-${b}`;

const start = myCall("aVal")("bVal");

export {};
