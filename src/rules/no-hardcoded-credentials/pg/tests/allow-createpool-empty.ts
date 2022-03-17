import { Pool } from "pg";

// pool will use environment variables for connection information
const pool = new Pool();

pool.end();
