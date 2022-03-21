const obj_a = { a: "aVal" };
const obj_b = { b: "bVal" };
const obj_c = { ...obj_a, ...obj_b };

const start = obj_c.a + obj_c.b;

export {};
