# No Vulnerable Dependencies (no-vulnerable-dependencies/universal)

This rule acts similarily to tools such as `npm audit` with the main difference being that it is able to run directly and continuosly inside your editor allowing you to act quickly when issues with your dependencies are discovered.

If this rule has flagged an issues in your code then this means that the given dependency in the installed version has been reported vulnerable in the [Github Advisory Database](https://github.com/advisories). The database is queried at most every two hours or if you manually alter your dependencies, whatever comes first.

## Risk

Using vulnerable dependencies in your application may lead to a wide variety of security related issues, such as leaking your users credentials, remote code execution and much more.

Thus it is crucial to frequently manage your dependencies to ensure that they stay up to date. This can help avoid vulnerabilities that malicious parties are more likely to abuse since they are commonly known (i.e. published online).

## Actions

In order to mitigate the issue you should locate the `package.json` that has installed the vulnerable dependency and upgrade to at least the version reported by this rule.

Once you have located this file, then our rule [no-vulnerable-dependencies/package](https://github.com/lasselupe33/eslint-plugin-security-rules/blob/master/src/rules/no-vulnerable-dependencies/package/_docs.md) can assist you in the upgrade process.

### Ignore (Manual)

In case you are unable to upgrade the vulnerable package, or if you are certain that you are not using any of the vulnerable APIs from the package, then you can simply choose to ignore the warning. However, do note that this is highly discouraged and that we recommended to always invest time in keeping your dependencies up-to-date.

## Attributes

- [X] ✅ Recommended for ```.js,.jsx,.ts,.tsx```
- [ ] 🔧 Provides suggestion
- [ ] 💭 Enhanced with type information
- [ ] 🌩 Requires type information
- [X] 🏃‍♂️ Queries external database

## Background

To find out more regarding vulnerable dependencies you can visit the following links.

- <https://github.com/advisories>
- <https://ropesec.com/articles/vulnerable-dependencies/>
- <https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html>
