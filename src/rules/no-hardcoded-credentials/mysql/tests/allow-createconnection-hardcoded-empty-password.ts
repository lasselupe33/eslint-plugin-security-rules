import { createConnection } from "mysql";

const connection = createConnection({
  host: "localhost",
  user: "admin",
  database: "project",
  password: "",
  multipleStatements: true,
});

connection.end();
