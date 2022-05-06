import { userTables, client, unsafe } from "./config-connection";

client.query({
  text: `SELECT * FROM ${userTables.verifyEmailToken} WHERE \`user\` = jonathan`,
});
