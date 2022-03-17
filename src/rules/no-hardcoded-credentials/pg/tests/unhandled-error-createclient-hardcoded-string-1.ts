import { Client } from "pg";

const connectionString =
  "postgresql://root:secretpassword@database.com:3211/database";

const client = new Client({ connectionString });

client.end();
