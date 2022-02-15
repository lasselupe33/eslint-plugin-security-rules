import { connection } from "./config-connection";

connection.query(
  {
    sql: "SELECT * FROM `books` WHERE `author` = ?",
    timeout: 40000, // 40s
  },
  ["David"],
  function (error, results, fields) {
    // No op
  }
);
