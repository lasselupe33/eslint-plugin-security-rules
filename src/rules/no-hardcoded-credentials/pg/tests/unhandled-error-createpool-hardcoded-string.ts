import { Pool } from "pg";

const connectionString =
  "postgresql://root:secretpassword@database.com:3211/database";

const pool = new Pool({
  connectionString,
});

pool.end();
