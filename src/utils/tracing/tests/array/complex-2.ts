const arrA = ["aVal", "bVal"];
const arrB = [...[...arrA, "cVal"], "dVal", ...arrA];
const arrC = ["eVal", ...arrB];

const start = arrC[3];

export {};
