import * as fs from "fs";

import { Client, Pool } from "pg";

// Which of these are unsafe?

const config = {
  database: "database",
  host: "localhost",
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync("/path/to/server-certificates/root.crt").toString(), // Compliant
    key: fs.readFileSync("/path/to/client-key/postgresql.key").toString(), // Compliant
    cert: fs
      .readFileSync("/path/to/client-certificates/postgresql.crt") // Compliant
      .toString(),
    // passphrase: fs.readFileSync("/path/to/passwords/passphrase.txt"),
    // pfx: "Encoded pair",
    // dhparam: "dhparams", // Unsafe?
    // ecdhCurve: "ecdhCurve", // Unsafe?
    // key: "Key" // Unsafe?
  },
};

const client = new Client(config);
const pool = new Pool(config);

client.end();
pool.end();
