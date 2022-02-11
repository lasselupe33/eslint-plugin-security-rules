import { createPool } from "mysql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const connection = createPool({
  host: "localhost",
  user: "admin",
  database: "project",
  password: "SECRET",
  multipleStatements: true,
});
