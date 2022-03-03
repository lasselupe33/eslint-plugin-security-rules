import { Client } from "pg";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = new Client({
  user: "root",
  host: "database.com",
  database: "database",
  password: "secretpassword",
  port: 3211,
});
