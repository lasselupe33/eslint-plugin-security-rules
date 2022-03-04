import { Pool } from "pg";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pool = new Pool({
  user: "root",
  host: "database.com",
  database: "database",
  password: "secretpassword",
  port: 3211,
});
