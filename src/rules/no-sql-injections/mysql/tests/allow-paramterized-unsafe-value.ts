import { connection, unsafe } from "./config-connection";

connection.query(
  {
    sql: "SELECT * FROM `books` WHERE `author` = ? ",
    timeout: 40000, // 40s
  },
  unsafe,
  function (error, results, fields) {
    // No op
  }
);
