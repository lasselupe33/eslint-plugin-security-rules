import { createConnection } from "mysql";

const connection = createConnection({
  host: "localhost",
  ssl: {
    ca: "CA thingy",
  },
});
