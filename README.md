<h1 align="center">ESLint Plugin Security Rules</h1>

ESLint security rules to help harden your project as early as possible.

**NB:** This project was written as an artefact for a master's thesis at the IT University of Copenhagen and it should still be considered a work in progress.

## Installation

- Requires Node.js `>=14`
- Requires ESLint `>=8`

```
yarn add --dev eslint-plugin-security-rules
```


## Usage

To include the recommended `eslint-plugin-security-rules` to your ruleset add the following to your `.eslintrc` configuration:

```json
{
  "extends": [
    "plugin:security-rules/recommended"
  ]
}
```

## Rules

`eslint-plugin-security-rules` comes with several rulesets, scoped to the environment that they target, allowing you to only enable rules relevant to your project.

- `'plugin:security-rules/recommended'`: recommended security rules, including all available rules that you can drop in without any additional configuration.
- `'plugin:security-rules/node'`: rules related to vulnerabilities occuring in code that is intended to be executed in a NodeJS environment.
- `'plugin:security-rules/browser'`: rules related to vulnerabilities occuring in code that is intended to be executed in a browser.
- `'plugin:security-rules/universal'`: rules related to vulnerabilities that may occur regardless of which environment the code is being run.
- `'plugin:security-rules/package'`: rules related to ensure safe usage of dependencies by scanning `package.json`-files.
- `'plugin:security-rules/react'`: security related rules targeting code using the `react` package.
- `'plugin:security-rules/pg'`: security related rules targeting code using the `pg` (postgres) package.
- `'plugin:security-rules/mysql'`: security related rules targeting code using the `mysql` package.

**Key**:

- ✅ = recommended,
- 🔧 = fixable with suggestion,
- 💭 = enchaned with TypeScript type information,
- 🌩 = requires TypeScript type information

### Browser

| **Name** | **Description** | ✅ | 🔧 | 💭 | 🌩 |
|:--------|:------------|:--:|:--:|:--:|:----:|
| [security-rules/browser/no-xss](https://github.com/lasselupe33/eslint-plugin-security-rules/blob/master/src/rules/no-xss/browser/_docs.md) | Detects DOM-based XSS vulnerabilities | ✅ | 🔧 | 💭 | |

| **Name** | **Description** | ✅ | 🔧 | 💭 | 🌩 |
|:--------|:------------|:--:|:--:|:--:|:----:|
| [security-rules/node/no-unsafe-path](https://github.com/lasselupe33/eslint-plugin-security-rules/blob/master/src/rules/no-unsafe-path/node/_docs.md) | Avoids usage of unsafe paths when interacting with the file-system using "fs" | ✅ | 🔧 | 💭 | |

### Universal

| **Name** | **Description** | ✅ | 🔧 | 💭 | 🌩 |
|:--------|:------------|:--:|:--:|:--:|:----:|
| [security-rules/universal/no-hardcoded-credentials](https://github.com/lasselupe33/eslint-plugin-security-rules/blob/master/src/rules/no-hardcoded-credentials/universal/_docs.md) | Detects hardcoded secrets in a file | ✅ | | | |
| [security-rules/universal/no-vulnerable-dependencies](https://github.com/lasselupe33/eslint-plugin-security-rules/blob/master/src/rules/no-vulnerable-dependencies/universal/_docs.md) | **TODO** | ✅ | | | |

### Package.json

| **Name** | **Description** | ✅ | 🔧 | 💭 | 🌩 |
|:--------|:------------|:--:|:--:|:--:|:----:|
| [security-rules/package/no-vulnerable-dependencies](https://github.com/lasselupe33/eslint-plugin-security-rules/blob/master/src/rules/no-vulnerable-dependencies/package/_docs.md) | **TODO** | ✅ | 🔧 | | |

### Package specific rulesets

The following ruleset are related to specific popular packages, scanning for vulnerable usages in these.

#### React

| **Name** | **Description** | ✅ | 🔧 | 💭 | 🌩 |
|:--------|:------------|:--:|:--:|:--:|:----:|
| [security-rules/react/no-xss](https://github.com/lasselupe33/eslint-plugin-security-rules/blob/master/src/rules/no-xss/react/_docs.md) | Detects DOM-based XSS vulnerabilities introduced in JSX | ✅ | 🔧 | 💭 | |

#### Postgres (pg)

| **Name** | **Description** | ✅ | 🔧 | 💭 | 🌩 |
|:--------|:------------|:--:|:--:|:--:|:----:|
| [security-rules/pg/no-sql-injections](https://github.com/lasselupe33/eslint-plugin-security-rules/blob/master/src/rules/no-sql-injections/pg/_docs.md) | Detects queries vulnerable to SQL Injections | ✅ | 🔧 | 💭 | |
| [security-rules/pg/no-hardcoded-credentials](https://github.com/lasselupe33/eslint-plugin-security-rules/blob/master/src/rules/no-hardcoded-credentials/pg/_docs.md) | Detects hardcoded secrets in a file  | ✅ | | | |

#### MySQL

| **Name** | **Description** | ✅ | 🔧 | 💭 | 🌩 |
|:--------|:------------|:--:|:--:|:--:|:----:|
| [security-rules/mysql/no-sql-injections](https://github.com/lasselupe33/eslint-plugin-security-rules/blob/master/src/rules/no-sql-injections/mysql/_docs.md) | Detects queries vulnerable to SQL Injections | ✅ | 🔧 | 💭 | |
| [security-rules/mysql/no-hardcoded-credentials](https://github.com/lasselupe33/eslint-plugin-security-rules/blob/master/src/rules/no-hardcoded-credentials/mysql/_docs.md) | Detects hardcoded secrets in a file  | ✅ | | | |
