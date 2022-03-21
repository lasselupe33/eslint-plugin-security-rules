import { client as a, unsafe } from "./config-connection";

const _unsafe = await (await fetch("https://malicious.site")).text();

const adr = _unsafe;

const query = "SELECT * FROM users WHERE city = " + adr;

a.query(query);
