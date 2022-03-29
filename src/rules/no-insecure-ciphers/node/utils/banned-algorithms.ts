export const bannedAlgs = new Set<string>([
  "DES", // DES is insecure due to the short key length.
  // 3DES is disallowed after 2023, disallowed in new applications after 2017
  // Source: https://csrc.nist.gov/publications/detail/sp/800-131a/rev-2/final
  // (Table 1, Page 7)
  "DES-EDE",
  "DES-EDE3",
  "RC2", // RC2 is vulnerable to a related-key attack
  "RC4", // RC4 is vulnerable to several attacks
  "BF", // Blowfish use a 64-bit block size makes it vulnerable to birthday attacks
  // ECB is vulnerable in that a block is encrypted without randomness. That
  // means that a block will always get encrypted to the same ciphertext.
  "AES-128-ECB",
  "AES-192-ECB",
  "AES-256-ECB",
  "BF-ECB",
  "CAMELLIA-128-ECB",
  "CAMELLIA-192-ECB",
  "CAMELLIA-256-ECB",
  "CAST5-ECB",
  "DES-ECB",
  "GOST89-ECB",
  "RC2-ECB",
]);
