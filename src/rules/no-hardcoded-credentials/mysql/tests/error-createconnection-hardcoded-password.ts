import { createConnection } from "mysql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const connection = createConnection({
  host: "localhost",
  user: "admin",
  database: "project",
  password: "SECRET",
  multipleStatements: true,
});
