import { createConnection } from "mysql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
