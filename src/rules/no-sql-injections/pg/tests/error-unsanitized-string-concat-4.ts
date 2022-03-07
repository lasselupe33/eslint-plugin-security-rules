import { client as a, unsafe } from "./config-connection";

const adr = unsafe;

const p1 = "SELECT * FROM users WHERE city =";
const query = [p1, adr].join();

a.query(query);
