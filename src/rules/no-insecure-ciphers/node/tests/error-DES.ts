import * as crypto from "crypto";

const nonce = crypto.randomBytes(8);
const key = Buffer.from(crypto.randomBytes(8));

crypto.createCipheriv("DES", key, nonce); // Unsafe
