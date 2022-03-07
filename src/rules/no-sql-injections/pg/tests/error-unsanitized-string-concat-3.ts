import { client as a, unsafe } from "./config-connection";

const adr = unsafe;

const str = "SELECT * FROM users WHERE city =";
const query = str.concat(" ", adr);

a.query(query);
