import * as fs from "fs";

import { createConnection } from "mysql";

// Which of these are unsafe?

const connection = createConnection({
  host: "localhost",
  ssl: {
    ca: fs.readFileSync(__dirname + "/mysql-ca.crt"), // SAFE
    cert: fs.readFileSync(__dirname + "/mysql-cert.crt"), // SAFE - Public certificate used to enc. communication
    // dhparam: fs.readFileSync(__dirname + "/dhparam.pem"), // SAFE
    // ecdhCurve: fs.readFileSync(__dirname + "ecdhCurve.txt").toString(), // SAFE
    key: fs.readFileSync(__dirname + "key.key"), // SENSITIVE - Private certificate used to decrypt data
    passphrase: fs.readFileSync(__dirname + "sharedPassPhrase.txt").toString(), // Used to decrypt pfx
    pfx: "Safe", // SAFE - Encrypted
  },
});

connection.end();
