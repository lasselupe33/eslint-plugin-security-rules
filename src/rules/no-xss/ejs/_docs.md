# No XSS (no-xss/ejs)

This rule aims to detect potential Reflected and Stored Cross-Site Scripting (XSS) vulnerabilities, caused by unsafe usage of the `ejs` package.

If this error has flagged an issue in your code this means that you may be inserting unsafe data into a vulnerable [sink](#sinks-and-sources).

In order to reduce the amount of false positives reported by this rule we attempt to trace the value inserted into sinks back to their [source](#sinks-and-sources). During this trace, if we can observe that the value has been properly sanitized before insertion *(but after modification!)* or if the inserted data is a simple JavaScript primitive an error will not be reported.

## Risk

Cross-site scripting may result in arbitrary malicious code being executed inside your end users browsers.

Such malicious code may, for example, access any cookies, session tokens and other sensitive information, exposing and leaving your end users vulnerable.

## Actions

In order to mitigate the issue reported by this rule you may take one of the following approaches:

### Apply the provided ESLint suggestion (Semi-automatic fix)

You can apply the suggestion/automatic fix that this rules proposes, however do note that **this suggestion alters program functionality**.

The  will ensure that the unsafe value is sanitized before being inserted into the vulnerable sink using your preferred sanitation library. *(This can be [configured](#configuration))*

Using this suggestion, with default configurations, the following vulnerable code...

```js
import { render } from "ejs";

async function myRenderer() {
  const dataObj = {
    templateValue: await (await fetch("https://malicious.site")).text(),
  };

  render("template/path", dataObj);
}
```

...will be fixed and transform into this:

```js
import { sanitize } from "isomorphic-dompurify";
import { render } from "ejs";

async function myRenderer() {
  const dataObj = {
    templateValue: sanitize(
      await (await fetch("https://malicious.site")).text(), 
      { USE_PROFILES: { html: true } }
    ),
  };

  render("template/path", dataObj);
}
```

### Sanitize value manually (Manual)

In case you do not wish to use the provided suggestion you must ensure that you manually sanitize the data before it is inserted into the sink.

Once you have done so the error reported from this rule should vanish.

### Ignore (Manual)

In case you are certain that you have encountered a false positive, then you can simply ignore the report.

**NB: In case you know that a domain is trusted, then you can supply this as a [configuration](#configuration) option!**

## Configuration

In order to tailor this rule to your specific project a couple of parameters can be tweaked.

Firstly, in case you wish to **use a library other than ```isomorphic-dompurify```** you can configure this as follows:

```json
"rules": {
  "security-rules/ejs/no-xss": ["error", {
    "sanitation": {
      "package": "isomorphic-dompurify",
      "method": "sanitize",
      "usage": "sanitize(<% html %>, { USE_PROFILES: { html: true } })"
    }
  }],
},
```

Wherein you insert values matching your desired sanitaiton library.

**NB: The configuration option below is still a work in progress.**

Secondly, you can **specify domains that are known to be safe** to reduce the amount of false positives:

```json
"rules": {
  "security-rules/ejs/no-xss": ["error", {
    "trusted": ["https://my-site.com"]
  }],
},
```

## Attributes

- [X] ✅ Recommended for ```.js,.jsx,.ts,.tsx```
- [X] 🔧 Provides suggestion
- [X] 💭 Enchanced with type information
- [ ] 💭💭 Requires type information

## Background

To find out more regarding XSS vulnerabilities you can visit the following links.

- <https://owasp.org/www-community/attacks/xss/>
- <https://csrc.nist.gov/glossary/term/cross_site_scripting>

### Sinks and sources

In the context of XSS vulnerabilities **sinks** are often defined as specific assignments or function calls that may trigger XSS attacks.

*For this rule we consider all values inserted into an EJS template as potential sinks.*

In contrast **sources** are seen as the origin of the value beign assigned to a sink. For this rule we assume all sources to be unsafe unless that can be determined to be a JavaScript primitive.
