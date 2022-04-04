# No Hardcoded Credentials (no-hardcoded-credentials/mysql)

This rule aims to detect potential hardcoded credentials in the mysql package.

The rule detects secret by examining places where secrets are used and checking if the secret contains a literal.

If this rule has flagged an issue in your code, this means that you may have included a secret.

## Risk

Hardcoded credentials pose a risk, as they give the user of the program the possibility to misuse the credentials in a malicious manner.

Often, the same hardcoded credentials are used across multiple services, which may lead to leaked confidential information.

Once a credential is added to the code, it is often forgotten and may acidently get published to a git history, or even be included in a final product for anyone to find.

## Actions

In order to mitigate the issue reported by this rule, one need too implement either a secret manager, or include the secret in the process environment. While the last option is not as safe as a secret manager, it's minimizes the risk compared to hardcoded credentials.

### Moving the value to the process environment. (Manual)

Consider the following example:

```js
const connection = mysql.createConnection({
  host     : "database.com",
  user     : "root",
  password : "secretpassword"
});
```

Here, we can replace the password string with a process environment.

```js
const connection = mysql.createConnection({
  host     : "database.com",
  user     : "root",
  password : process.env["db1"],
});
```

We can then set the process environment in linux by using `export` and `set` on Windows:

```shell
export db1=secretpassword
```

Alternatively, [mysql allows the creation](https://www.npmjs.com/package/mysql#running-tests) of both client- and pools without any password set in the code. The configuration is then retrieved directly from the process environment.

```js
const connection = mysql.createConnection({
  host     : "database.com",
});
```

```shell
PGUSER=root \
  MYSQL_USER=root \
  MYSQL_PASSWORD==secretpassword \
  MYSQL_DATABASE=database \
  MYSQL_PORT=3211 \
  node app.js
```

### Ignore (Manual)

In case you are certain that you have encountered a false positive, then you can simply ignore the report.

## Configuration

## Attributes

- [X] ✅ Recommended for ```.js,.jsx,.ts,.tsx```
- [ ] 🔧 Provides suggestion
- [X] 💭 Enchanced with type information
- [ ] 🌩 Requires type information

## Background

To find out more regarding hardcoded credentials, you can visit the following links.

- <https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password>
- <https://www.cyberark.com/what-is/secrets-management/>
