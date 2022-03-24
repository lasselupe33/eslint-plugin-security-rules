import * as crypto from "crypto";

export const nonce = crypto.randomBytes(8);
export const key = Buffer.from(crypto.randomBytes(64));

crypto.createCipheriv("DES", key, nonce); // Unsafe
