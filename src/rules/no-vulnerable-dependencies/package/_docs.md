# No Vulnerable Dependencies (no-vulnerable-dependencies/package)

This rule acts similarily to tools such as `npm audit` with the main difference being that it is able to run directly and continuosly inside your editor allowing you to act quickly when issues with your dependencies are discovered.

If this rule has flagged an issues in your code then this means that the given dependency in the installed version has been reported vulnerable in the [Github Advisory Database](https://github.com/advisories). The database is queried at most every two hours or if you manually alter your dependencies, whatever comes first.

**NB:** In order for this rule to work inside VSCode then you must enable ESLint in `package.json` files manually by adding the following configuration entry in your VSCode editor:

```JSONC
"eslint.validate": [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
  "json",
  // ... and possibly more. Most importantly do note that 'json' has been added.
]
```

## Risk

Using vulnerable dependencies in your application may lead to a wide variety of security related issues, such as leaking your users credentials, remote code execution and much more.

Thus it is crucial to frequently manage your dependencies to ensure that they stay up to date. This can help avoid vulnerabilities that malicious parties are more likely to abuse since they are commonly known (i.e. published online).

## Actions

In order to mitigate the issue reported by this rule you may take one of the following approaches:

### Apply the provided ESLint suggestion (Semi-automatic fix)

In case the vulnerability already has been patched in a more recent version of the dependency that you are using then you can simply apply the ESLint suggestion which will update the package to the first version in which all reported vulnerabilities have been fixed. **You must re-install your packages manually afterwards using your preferred package manager, e.g. by running `yarn install`**

However do note that **this suggestion may alter program functionality** since updates to dependencies may also include breaking changes and more.

### Upgrade dependency manually (Manual)

In case you do not wish to use the provided suggestion you must ensure that you manually upgrade to a version that does not have any vulnerabilities reported.

Once you have done so the error reported from this rule should vanish.

In case you would like more information on the identifier vulnerability then you can copy-paste the vulnerability id (which will look similar to *GHSA-gxr4-xjj5-5px2*) into your favorite search engine which will then take you to the relevant entry in the [Github Advisory Database](https://github.com/advisories).

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
