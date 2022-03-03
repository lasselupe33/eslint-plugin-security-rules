import { pool } from "./config-connection";

pool.connect().then((client) => {
  return client
    .query("SELECT * FROM cars WHERE id = $1", [1])
    .then((res) => {
      client.release();
      console.log(res.rows[0]);
    })
    .catch((err) => {
      client.release();
      console.log(err.stack);
    });
});
