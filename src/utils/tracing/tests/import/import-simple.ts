import { a, b, c, myFunc, MyClass } from "./exports/export-simple";

const instance = new MyClass("eVal");

const start = `${a}-${b}-${c}-${myFunc("dVal")}-${instance.a}`;
