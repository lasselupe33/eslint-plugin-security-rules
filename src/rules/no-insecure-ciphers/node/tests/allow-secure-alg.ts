import { createCipheriv, randomBytes } from "crypto";

const nonce = randomBytes(12);
const key = Buffer.from(randomBytes(32));

createCipheriv("AES-256-GCM", key, nonce); // Safe
