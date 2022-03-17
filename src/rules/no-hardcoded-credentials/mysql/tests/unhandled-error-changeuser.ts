import { createConnection } from "mysql";

const connection = createConnection({
  host: "localhost",
  user: "admin",
  database: "project",
  password: process.env["ADMIN_PASSWORD"],
  multipleStatements: true,
});

connection.changeUser({ user: "john", password: "secret" }, function (err) {
  if (err) throw err;
});

connection.end();
