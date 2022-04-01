import path from "path";

const arr = [1, 2, 3];
const pth = "myPath.ts";

const start = `${path.join(__dirname, pth)}-${arr.join("-")}`;

export {};
