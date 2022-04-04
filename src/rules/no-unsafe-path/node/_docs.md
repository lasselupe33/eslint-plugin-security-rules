# No Unsafe Path (no-unsafe-path/node)

This rule attempts to avoid usage of unsafe paths when interacting with the file-system using the NodeJS "fs"-package.

If this rules has raised an error in your project it likely means that you have used external input that has not been sanitized to access a specific file on the file-system. The expected sanitization method can be [configured](#configuration).

In order to reduce the amount of false positives reported by this rule we attempt to trace the value used as a path back to its definition. During this trace, if we can observe that the value has been properly sanitized before insertion *(but after modification!)* or if the inserted data is a simple JavaScript primitive an error will not be reported.

## Risk

Allowing external values to be used to access specific locations on the file-system may allow malicious parties to access files that they should not be able to access.

Consider the snippet below, wherein we try to read a specific user based on external input:

```ts
import fs from "fs";

const username = getInput(); // ... implemented somewhere else, might evaluate to "../etc/passwd"

fs.readFileSync(`/Users/${userInput}`, "utf-8");
```

In that example a malicious party may be able to access the passwd file of the server, as well as other sensitive files.

## Actions

In order to mitigate the issue reported by this rule you may take one of the following approaches:

### Apply the provided ESLint suggestion (Semi-automatic fix)

You can apply the suggestion/automatic fix that this rules proposes, however do note that **this suggestion alters program functionality**.

This will ensure that the unsafe path is sanitized before being used to access the file system using your preferred sanitation method. *(This can be [configured](#configuration))*

Using this suggestion, with default configurations, the following vulnerable code...

```js
import { readFile } from "fs/promises";

const unsafe = await (await fetch("evil.site")).text();
const file = await readFile(unsafe, "utf-8");
}
```

...will be fixed and transform into this:

```js
import path from "path";
import sanitizeFilename from "sanitize-filename";

import { readFile } from "fs/promises";

const unsafe = await (await fetch("evil.site")).text();
const file = readFile(sanitizePath(__dirname, "<root-directory-from-config>", unsafe), "utf-8");

sanitizePath(baseDir: string, rootDir: string, path: string): string {
  // ... implementation based on the 'sanitize-filename' package
}
```

Do note that the fix uses a `sanitizePath` method that takes three parameters:

* the `baseDir` that the method is called from
* the `rootDir` specifying the root directory the path must be contained with.
* the `path` which is the value to be sanitized.

The default implementation is based upon the package `sanitize-filename` and ensures that unsafe values are stripped from the input and extends upon this to ensure that the sanitized value stays within the `rootDir` boundaries. Do note that in case the input attempts to leave the `rootDir` the implementation will **throw an error by default**.

In case you already have an existing sanitization method that you wish to use, or if you wish to alter the default `rootDir` that the auto-fix uses then this can be [configured](#configuration).

### Sanitize value manually (Manual)

If you want to implement sanitation manually you need to consider multiple cases. You should at least always consider the following:

* Poison null bytes
* Whitelisting
* Preventing directory traversal

Once you have implemented you own fix then you should specify its location in the [rule configuration](#configuration) to avoid false positives in the future.

Please refer to <https://www.stackhawk.com/blog/node-js-path-traversal-guide-examples-and-prevention/> for more information.

### Ignore (Manual)

In case you are certain that you have encountered a false positive, then you can simply ignore the report.

## Configuration

This rule supports several configuration options to tailor to specific projects, following the format below:

```JSONC
"rules": {
  "security-rules/node/no-unsafe-path": ["error", {
    "sanitation": {
      "method": "sanitizePath", // name of sanitation method
      "location": <"{{inplace}}" | "{{root}}/${path}" | "{{abs}}:${path}">, // location of sanitation method
      "defaultExport": <true | false>
    },
    "root": <"{{root}}" | "{{root}}/${path}" | "{{abs}}:${path}"> // the root directory that sanitation is allowed to escape to
  }],
},
```

### Sanitation method

Firstly, the `sanitation`-object in the configuration can point to your own implementation of a sanitation function, thus avoid duplication of code be re-inseritng the fix implementation into every file that needs sanitation.

The object should contain a property name `method` which specifies the name of the sanitation method. By default we assume that the method is NOT a default export, however this can be specified using the property `defaultExport`.

The location of the sanitation method is configured using the `location` property which can be defined in several different ways. `{{inplace}}` maps to the current file, `{{root}}/${path}` maps to location relative to the root of the project and finally `{{abs}}:${path}` maps to an absolute path.

Finally, do note that the sanitation method must take three parameters for the automatic fix to work, which should be the follwing:

* baseDir (The directory of the file calling the sanitation method, i.e. '__dirname')
* rootDir (The root directory the sanitized method is allowed to escape to)
* path (The path to be sanitized)

### Root directory specification

The `root` property specifies the root folder that the automatic fix uses when applied. This can be configured similar to how `sanitation.location` is configured, being either relative to the `{{root}}` of the project or an absolute (`{{abs}}`) path.

## Attributes

- [X] ✅ Recommended for ```.js,.jsx,.ts,.tsx```
- [X] 🔧 Provides suggestion
- [X] 💭 Enhanced with type information
- [ ] 🌩 Requires type information

## Background

To find out more regarding incorrect limitation of path traversal please refer to the following links.

* <https://cwe.mitre.org/data/definitions/22.html>
* <https://www.stackhawk.com/blog/node-js-path-traversal-guide-examples-and-prevention/>
