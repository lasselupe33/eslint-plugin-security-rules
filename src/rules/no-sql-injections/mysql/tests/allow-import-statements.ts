import { connection as a } from "./config-allow-import-statements";

const val = "Chicago";

const adr = a.escape(val);

a.query(
  {
    timeout: 40000, // 40s
    sql: `SELECT * FROM \`books\` WHERE \`author\` = ${a.escape(
      adr
    )} OR author = ${adr}`,
  },
  (err, rows) => {
    if (err) throw err;
  }
);
