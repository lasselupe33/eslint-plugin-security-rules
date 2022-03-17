import { Client } from "pg";

// client will use environment variables for connection information
const client = new Client();

client.end();
