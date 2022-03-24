export const bannedAlgs = new Set<string>([
  "DES", // DES / 3DES is unsecure
  "DES-EDE", // DES / 3DES is unsecure
  "DES-EDE3", // DES / 3DES is unsecure
  "RC2", // RC2 is vulnerable to a related-key attack
  "RC4", // RC4 is vulnerable to several attacks
  "BF", // Blowfish use a 64-bit block size makes it vulnerable to birthday attacks
  // ECB is vulnerable in that a block is encrypted without randomness. That
  // means that a block will always get encrypted to the same ciphertext.
  "aes-128-ecb",
  "aes-192-ecb",
  "aes-256-ecb",
  "bf-ecb",
  "camellia-128-ecb",
  "camellia-192-ecb",
  "camellia-256-ecb",
  "cast5-ecb",
  "des-ecb",
  "gost89-ecb",
  "rc2-ecb",
]);
