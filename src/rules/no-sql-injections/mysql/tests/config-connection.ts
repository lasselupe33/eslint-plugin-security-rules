import { createConnection } from "mysql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const connection = createConnection({
  host: "localhost",
  user: "admin",
  database: "project",
  password: process.env["ADMIN_PASSWORD"],
  multipleStatements: true,
});

export const unsafe = "Test";
