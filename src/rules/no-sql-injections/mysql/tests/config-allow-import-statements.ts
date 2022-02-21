// import { createConnection } from "mysql";
import * as mysql from "mysql";

export const connection = mysql.createConnection({
  host: "localhost",
  user: "admin",
  database: "project",
  password: process.env["secret"],
  multipleStatements: true,
});
