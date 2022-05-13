import { createCipheriv as a, randomBytes as b } from "crypto";

const nonce = b(8);
const key = Buffer.from(b(8));

a("DES", key, nonce); // Unsafe
