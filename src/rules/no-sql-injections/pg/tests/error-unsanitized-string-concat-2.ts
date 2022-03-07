import { client as a, unsafe } from "./config-connection";

const adr = unsafe;

let query = "SELECT * FROM users WHERE city = ";
query += adr;

a.query(query);
