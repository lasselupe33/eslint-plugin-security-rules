import { Client } from "pg";

const client = new Client({
  user: "root",
  host: "database.com",
  database: "database",
  password: "secretpassword",
  port: 3211,
});

client.end();
