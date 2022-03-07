// Unhandled autoamtic fix
import { client as a, unsafe } from "./config-connection";

const adr = unsafe;
const country = "DK";
const bool = false;

let query = "";

const orderBy = " ORDER BY city ASC;";

if (bool) {
  query = "SELECT * FROM users WHERE city = " + adr;
} else {
  query = "SELECT * FROM users WHERE city = " + adr;
  " AND WHERE country = " + country;
}

const totalQuery = query + orderBy;

a.query(totalQuery);
