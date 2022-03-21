import * as crypto from "crypto";

export const nonce = crypto.randomBytes(16);
export const key = process.env["cryptoKey"] as crypto.CipherKey;
