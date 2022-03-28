const a = 1;
const b = 2;
const c = 3;

const d = a ^ b; // 1 | 2
const e = c & d; // 3 | ( 1 | 2)
const f = e | e; // (3 | 1 | 2) | (3 | 1 | 2)

const start = f;

export {};
