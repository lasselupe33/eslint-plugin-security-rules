import * as fs from "fs";

import { createConnection } from "mysql";

const connection = createConnection({
  host: "localhost",
  ssl: {
    ca: fs.readFileSync(__dirname + "/mysql-ca.crt"),
    cert: fs.readFileSync(__dirname + "/mysql-cert.crt"),
    key: fs.readFileSync(__dirname + "key.key"),
    passphrase: fs.readFileSync(__dirname + "sharedPassPhrase.txt").toString(), // Used to decrypt pfx
    pfx: "Safe",
  },
});

connection.end();
