import { createConnection } from "mysql";

const connection = createConnection({
  host: "localhost",
  user: "admin",
  database: "project",
  password: process.env["ADMIN_PASSWORD"],
  multipleStatements: true,
});

connection.end();
