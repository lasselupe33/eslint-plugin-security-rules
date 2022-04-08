# No Insecure Ciphers (no-insecure-ciphers/node)

This rule aims to detect outdated - or insecure encryption algorithms used in the `cipher` suite.

The rule detects algorithms by tracing the algorithm identifier until a constant is met. If the constant appears on the banned list of algorithms, the error is triggered.

If this rule has flagged an issue in your code, this means that you should consider using an alternative - more secure encryption algorithm.

## Risk

Different algorithms pose different risks in that they are insecure in different manners. Using an insecure algorithm may lead to having an adversary learning the secret, that you're trying to protect.

Furthermore, using a non-standad encryption algorithm is dangerous, as a determined attacker may be able to break the algorithm and compromise data.

### Example of exposure

Here is an example of a picture encrypted using an `ECB` algorithm. As can be seen, key information can still be withdrawn from the picture.

Unencrypted | Encrypted using ECB
--- | ---
![Original picture](https://upload.wikimedia.org/wikipedia/commons/5/56/Tux.jpg) | ![Original picture](https://upload.wikimedia.org/wikipedia/commons/f/f0/Tux_ecb.jpg)

## Actions

In order to mitigate the issue reported by this rule, one would need to change the encryption algorithm that one uses. Changing the algorithm may sound easy, but it may break functionality, as the key size needs to furfill some requirements.

We specifically recommend one algorithm, `AES-GCM`, that supports 3 different key sizes securely.

### Replacing the algorithm. (Semi-automatic)

Consider the following example:

```ts
import * as crypto from "crypto";

export const iv = crypto.randomBytes(12);
export const key = Buffer.from(crypto.randomBytes(16)); // Key of size 128 bits, since 16 * 8 = 128

crypto.createCipheriv("DES", key, iv); // Unsafe
```

Here, we can replace the algorithm with the more secure `AES-128-GCM`. This algorithm requires a key size of 128 bits, but allows the iv vector be any positive size. The recommended default is 96 bits (12 bytes).

```ts
import * as crypto from "crypto";

export const iv = crypto.randomBytes(12);
export const key = Buffer.from(crypto.randomBytes(16));

crypto.createCipheriv("AES-128-GCM", key, iv); // Safe
```

When changing your algorithm, you should consider the size of the keys you are using. Currently, AES supports keys of sizes 16 bytes (128 bits), 24 bytes (192 bits) and 32 bytes (256 bits).

### Ignore (Manual)

In case you're certain that you want to continue using an unsafe algorithm, you can simply ignore this report.

## Configuration

Your project may rely on a specific cipher algorithm and the rule therefore allows you to add this to the list of suggestions.

This can be configured in ESLint configuration file e.g. as follows:

```JSONC
"rules": {
  "security-rules/node/no-unsafe-path": ["error", {
    "alg": "AES-128-CBC",
    "disableDefault": true
  }],
},
```

## Attributes

- [X] ✅ Recommended for ```.js,.jsx,.ts,.tsx```
- [X] 🔧 Provides suggestion
- [X] 💭 Enchanced with type information
- [ ] 🌩 Requires type information

## Banned Algorithms

The entire list of currently banned algorithms and the reasons for their ban can be seen in the file [banned-algorithms].

  [banned-algorithms]: utils/banned-algorithms.ts

## Background

To find out more regarding hardcoded credentials, you can visit the following links.

- <https://cwe.mitre.org/data/definitions/327.html>
- <https://owasp.org/Top10/A02_2021-Cryptographic_Failures/>
- <https://owasp.org/www-community/vulnerabilities/Using_a_broken_or_risky_cryptographic_algorithm>