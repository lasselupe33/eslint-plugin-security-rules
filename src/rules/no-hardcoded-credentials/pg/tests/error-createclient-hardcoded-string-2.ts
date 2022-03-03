import { Client } from "pg";

const connectionString =
  "postgresql://root:secretpassword@database.com:3211/database";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = new Client(connectionString);
