import * as fs from "fs";

import { createConnection } from "mysql";

// Which of these are unsafe?

const connection = createConnection({
  host: "localhost",
  ssl: {
    ca: fs.readFileSync(__dirname + "/mysql-ca.crt"),
    cert: fs.readFileSync(__dirname + "/mysql-cert.crt"),
    // dhparam: fs.readFileSync(__dirname + "/dhparam.pem"), // Insecure?
    // ecdhCurve: fs.readFileSync(__dirname + "ecdhCurve.txt").toString(), // Insecure?
    key: fs.readFileSync(__dirname + "key.key"),
    passphrase: fs.readFileSync(__dirname + "sharedPassPhrase.txt").toString(), // Used to decrypt pfx
    pfx: "Safe",
  },
});
