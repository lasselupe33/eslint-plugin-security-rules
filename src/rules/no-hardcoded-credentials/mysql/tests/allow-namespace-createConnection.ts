import * as mysql from "mysql";

const connection = mysql.createConnection({
  host: "localhost",
  user: "admin",
  database: "project",
  password: "",
  multipleStatements: true,
});

connection.end();
