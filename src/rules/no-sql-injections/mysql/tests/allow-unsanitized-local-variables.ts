import { connection } from "./config-connection";

const adr = "Chicago";

connection.query({
  timeout: 40000, // 40s
  sql: `SELECT * FROM \`books\` WHERE \`author\` = ${connection.escape(
    adr
  )} OR author = ${adr}`,
});
