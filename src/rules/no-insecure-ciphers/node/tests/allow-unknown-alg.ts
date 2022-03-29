import { createCipheriv, randomBytes } from "crypto";

const nonce = randomBytes(16);
const key = Buffer.from(randomBytes(32));

createCipheriv("CAMELLIA-256-CBC", key, nonce); // Unknown algorithm
