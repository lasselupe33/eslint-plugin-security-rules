/**
 * In case we cannot properly determine the value of the given index then the
 * whole array should be traced
 */

const arrA = ["aVal", "bVal"];
// @ts-expect-error Purposely invalid code
const arrB = [...arrA, "cVal", ...invalid, ...["eVal", "fVal"]];

const start = arrB[4];

export {};
