const arr = ["aVal", "bVal"];
const index = 1;

/**
 * We trace whole arrays when access is not given as a constant. We do not
 * handle this case based on the assumption that using variables as access
 * often will result having to trace the whole array regardless.
 */
const start = arr[index];

export {};
