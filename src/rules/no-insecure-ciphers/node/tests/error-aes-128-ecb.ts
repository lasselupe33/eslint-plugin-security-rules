import { createCipheriv, randomBytes } from "crypto";

const nonce = randomBytes(0);
const key = Buffer.from(randomBytes(16));

createCipheriv("aes-128-ecb", key, nonce); // Unsafe
