# No SQL Injections (no-sql-injections/pg)

This rule aims to detect potential SQL injection vulnerabilities, caused by the usage of unsanitized inputs.

If this error has flagged an issue in your code, this means that you may be inserting data that can manipulate your query.

## Risk

A successfull SQL injection attack may cause:

- Confidential data to be deleted or stolen
- Cause unauthorized access to systems or accounts
- Compromise individual machines or entire networks

## Actions

In order to mitigate the issue reported by this rule, unsafe data needs to be sanitized. The `pg` package has a built-in feature, that does this work. 

### Apply the provided ESLint suggestion (Automatic fix)

You can apply the suggestion/automatic fix that this rules proposes.

The  will ensure that the unsafe value is sanitized before being inserted into the query.

Using this suggestion, with default configurations, the following vulnerable code...

```js
const city = await (await fetch("https://malicious.site")).text();

const query = "SELECT * FROM users WHERE city = " + city;

client.query(query, (err, res) => {
  if (err) {
    console.log(err.stack);
  } else {
    console.log(res.rows[0]);
  }
});
```

...will be fixed and transform into this:

```js
const city = await (await fetch("https://malicious.site")).text();

const query = "SELECT * FROM users WHERE city = " + "$1";

client.query(query, [city], (err, res) => {
  if (err) {
    console.log(err.stack);
  } else {
    console.log(res.rows[0]);
  }
});
```

### Sanitize value manually (Manual)

In case you do not wish to use the provided suggestion, you must replace the value in the query with a placeholder, and move the value into the array of [placeholder values](https://node-postgres.com/features/queries#parameterized-query).

### Ignore (Manual)

In case you are certain that you have encountered a false positive, then you can simply ignore the report.

## Configuration


## Attributes

- [X] ✅ Recommended for ```.js,.jsx,.ts,.tsx```
- [X] 🔧 Provides suggestion
- [X] 💭 Enchanced with type information
- [ ] 🌩 Requires type information

## Background

To find out more regarding SQL injections you can visit the following links.

- <https://owasp.org/www-community/attacks/SQL_Injection>
