import { createPool } from "mysql";

const connection = createPool({
  host: "localhost",
  user: "admin",
  database: "project",
  password: "SECRET",
  multipleStatements: true,
});

connection.end();
