import { Client, ClientConfig } from "pg";

const clientConfig: ClientConfig[] = [
  {
    user: "root",
    host: "database.com",
    database: "database",
    password: "secretpassword",
    port: 3211,
  },
];

const clientConfig2 = clientConfig[0];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = new Client(clientConfig2);
