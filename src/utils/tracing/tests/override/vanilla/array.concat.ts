const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const arr3 = [7, 8, 9];

const start = arr1.concat(...arr2, ...arr3, 10).join("-");

export {};
