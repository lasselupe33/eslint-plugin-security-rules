import { client } from "./config-connection";

// promise
client
  .query("SELECT NOW() as now")
  .then((res) => console.log(res.rows[0]))
  .catch((ex) => console.error(ex.stack));
