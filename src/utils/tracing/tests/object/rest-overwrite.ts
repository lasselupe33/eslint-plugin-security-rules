const obj_a = { a: "aVal" };

// @ts-expect-error Purposuly overwrite obj_b.a
const obj_b = { a: "bVal", ...obj_a };

const start = obj_b.a;

export {};
