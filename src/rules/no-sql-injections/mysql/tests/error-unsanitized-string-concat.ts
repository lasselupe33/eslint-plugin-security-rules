import { connection as a, unsafe } from "./config-connection";

const adr = unsafe;

const query = "SELECT * FROM users WHERE city = " + adr;

a.query(query, (err, rows) => {
  if (err) throw err;
});
