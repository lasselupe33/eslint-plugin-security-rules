# No SQL Injections (no-sql-injections/mysql)

This rule aims to detect potential SQL injection vulnerabilities, caused by the usage of unsanitized inputs.

If this rule has flagged an issue in your code, this means that you may be inserting data that can manipulate your query.

## Risk

A successfull SQL injection attack may cause:

- Confidential data to be deleted or stolen
- Cause unauthorized access to systems or accounts
- Compromise individual machines or entire networks

## Actions

In order to mitigate the issue reported by this rule, unsafe data needs to be sanitized. The `mysql` package has several built-in feature, that does this work.

### Apply the provided ESLint suggestion (Semi-automatic fix)

You can apply the suggestion/automatic fix that this rules proposes.

The rule is unable to properly identify whether you're using a unsanitized identifier or value. Examples of identifiers are:

- Database names
- Table names
- Column names

While examples of values are:

- Literals such as integers (0, -231, 5231)
- DATETIME literals

To ensure proper sanitation, it is important that you first identify whether the sanitation should be done through escaping as a value or as an identifier.

Using this suggestion, with default configurations, the following vulnerable code...

```js
const selectStatement = await (await fetch("https://malicious.site")).text(); // Non-compliant

const data = { id: 1, lastName: "Tables" }; // Compliant

const query = `SELECT ${selectStatement} FROM health_records WHERE id = (${data.id})`; 

connection.query(query, (err, rows) => {
  if (err) throw err;
});
```

...will be fixed and transform into this:

```js
const selectStatement = await (await fetch("https://malicious.site")).text();

const data = { id: 1, lastName: "Tables" };

const query = `SELECT ${connection.escapeId(selectStatement)} FROM health_records WHERE id = ${data.id}`; // Compliant

connection.query(query, (err, rows) => {
  if (err) throw err;
});
```

### Sanitize value manually (Manual)

In case you do not wish to use the provided suggestion, you must sanitize the variable in the query with a placeholder or the escape function. It is important to first identify whether the vulnerable variable is an [identifier or a value](#apply-the-provided-eslint-suggestion-semi-automatic-fix).

#### Escape function

The [mysql](https://github.com/mysqljs/mysql#escaping-query-values) package provides two escape functions that one can apply to a variable to safely sanitize it. One can use `mysql.escape(value)`, `connection.escape(value)` or `pool.escape(value)` to escape values.

To escape identifiers, one instead need to use `mysql.escapeId(identifier)`, `connection.escapeId(identifier)` or `pool.escapeId(identifier)` As such, the vulnerable query from [earlier](#apply-the-provided-eslint-suggestion-semi-automatic-fix), is escaped as follows:

```js
const query = `SELECT ${connection.escapeId(selectStatement)} 
  FROM health_records WHERE id = ${connection.escape(data.id)}`;
```

#### Parameterization

The [mysql](https://github.com/mysqljs/mysql#escaping-query-values) also allow for the usage of placeholder values instead. Under the hood, the package calls the [escape](#escape-function) functions.

Once again, you need to identify whether the vulnerable varaiable is a [value or identifier]((#apply-the-provided-eslint-suggestion-semi-automatic-fix)).

If you've identified the variable as a value, you replace the variable in the query with a single `?`.

If you've identified the variable an identifier, you replace the variable in the query with two `??`.

Finally, you move the variables into an array directly after the query call. It is important to note, that the order in which the values appear in the array, is the order that they should appear in the query. As such, our example from [earlier](#apply-the-provided-eslint-suggestion-semi-automatic-fix) is parameterized as follows:

```js
const query = `SELECT ?? FROM health_records WHERE id = ?`;

connection.query(query, [selectStatement, data.id]});
```

### Ignore (Manual)

In case you are certain that you have encountered a false positive, then you can simply ignore the report.

## Configuration

## Attributes

- [X] ✅ Recommended for ```.js,.jsx,.ts,.tsx```
- [X] 🔧 Provides suggestion
- [X] 💭 Enhanced with type information
- [ ] 🌩 Requires type information

## Background

To find out more regarding SQL injections you can visit the following links.

- <https://owasp.org/www-community/attacks/SQL_Injection>
