import * as crypto from "crypto";

import { key, nonce } from "./config-crypto";

crypto.createCipheriv("DES", key, nonce); // Unsafe
