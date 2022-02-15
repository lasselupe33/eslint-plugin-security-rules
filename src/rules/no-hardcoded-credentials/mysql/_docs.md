# MySQL - No hardcoded credentials
[CWE-798](https://cwe.mitre.org/data/definitions/798.html)

## What and where?
This vulnerability is introduced every time credentials are hard-coded into software. Examples of credentials could be connection-strings to databases that contains passwords, cryptographic keys and in general everything that is considered sensitive.

If, for instance, these credentials gets pushed to a public github repository, they're available for malicious parties to use.

## Mitigations
