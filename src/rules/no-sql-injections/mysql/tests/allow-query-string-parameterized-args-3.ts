import { connection } from "./config-connection";

const query = "SELECT * FROM `books` WHERE `author` = ?";

connection.query(query, "David", function (error, results, fields) {
  // No op
});
