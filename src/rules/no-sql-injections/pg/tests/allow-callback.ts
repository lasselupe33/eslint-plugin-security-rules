import { client } from "./config-connection";

// callback
client.query("SELECT NOW() as now", (error, res) => {
  if (error) {
    console.log(error.stack);
  } else {
    console.log(res.rows[0]);
  }
});
