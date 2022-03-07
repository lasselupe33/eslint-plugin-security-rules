import { client, unsafe } from "./config-connection";

const adr = unsafe;

client.query({
  text: `SELECT * FROM \`books\` WHERE \`author\` = jonathan OR author = ${adr}`,
});
