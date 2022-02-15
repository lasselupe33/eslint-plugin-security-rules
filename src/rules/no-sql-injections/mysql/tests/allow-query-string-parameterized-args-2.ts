import { connection } from "./config-connection";

connection.query(
  "SELECT * FROM `books` WHERE `author` = ?",
  "David",
  function (error, results, fields) {
    // No op
  }
);
