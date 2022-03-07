import { client as a, unsafe } from "./config-connection";

const adr = unsafe;

const query = "SELECT * FROM users WHERE city = " + adr;

a.query(query);
