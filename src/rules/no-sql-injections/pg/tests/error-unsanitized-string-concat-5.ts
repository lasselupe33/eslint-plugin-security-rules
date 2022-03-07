import { client as a, unsafe } from "./config-connection";

const adr = unsafe;
const country = "DK";

const query =
  "SELECT * FROM users WHERE city = " + adr + " AND WHERE country = " + country;

const orderBy = " ORDER BY city ASC;";

const totalQuery = query + orderBy;

a.query(totalQuery);
