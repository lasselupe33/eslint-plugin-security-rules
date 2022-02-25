import { connection, unsafe } from "./config-connection";

const adr = unsafe;

connection.query({
  timeout: 40000, // 40s
  sql: `SELECT * FROM \`books\` WHERE \`author\` = ${connection.escape(
    adr
  )} OR author = ${adr}`,
});
