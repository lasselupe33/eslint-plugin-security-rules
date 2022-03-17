import { Pool } from "pg";

const pool = new Pool({
  user: "root",
  host: "database.com",
  database: "database",
  password: "secretpassword",
  port: 3211,
});

pool.end();
