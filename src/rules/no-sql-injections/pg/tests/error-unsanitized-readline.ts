import { createInterface } from "readline";

import { client as a } from "./config-connection";

const readLine = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

let phone = "";

readLine.question("Your phone number?\n", (b: string) => (phone = b)); // Automatic fix not working
const query = "SELECT * FROM users WHERE phone = " + phone;

a.query(query, [phone], (err, result) => console.log(result));
