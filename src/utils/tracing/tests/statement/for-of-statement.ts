const arr = [1, 2, 3];
const obj = {
  a: 4,
  b: 5,
  c: 6,
};

let val = 0;

for (const a of arr) {
  val += a;
}

for (const b of Object.values(obj)) {
  val += b;
}

const start = val;

export {};
