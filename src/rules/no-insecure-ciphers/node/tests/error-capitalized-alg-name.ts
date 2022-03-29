import { createCipheriv, randomBytes } from "crypto";

const nonce = randomBytes(0);
const key = Buffer.from(randomBytes(16));

createCipheriv("AeS-256-eCB", key, nonce); // Unsafe
