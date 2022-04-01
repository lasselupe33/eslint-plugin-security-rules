import { PoolClient } from "pg";

import { pool, unsafe } from "./config-connection";

const userTables = {
  verifyEmailToken: "verify_email_token",
};

async function body(dbClient: PoolClient) {
  // We only want at most one verification token active for any given user at
  // any given time
  await Promise.all([
    dbClient.query({
      text: `
        DELETE FROM "${userTables.verifyEmailToken}"
        WHERE
          "userId" = $1
      `,
      values: ["input.userId"],
    }),

    dbClient.query({
      text: `
        INSERT INTO "${userTables.verifyEmailToken}"
          ("userId", "token", "createdAt", "expiresAt") VALUES
          ($1, ${unsafe}, $3, $4)
      `,
      values: ["input.userId", "input.token", "createdAt", "expiresAt"],
    }),
  ]);

  return;
}

const test = pool.connect().then((client) => body(client));
