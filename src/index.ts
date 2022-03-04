import { mysqlNoHardcodedCredentials } from "./rules/no-hardcoded-credentials/mysql/_rule";
import { pgNoHardcodedCredentials } from "./rules/no-hardcoded-credentials/pg/_rule";
import { uniNoHardcodedCredentials } from "./rules/no-hardcoded-credentials/universal/_rule";
import { mysqlNoSQLInjections } from "./rules/no-sql-injections/mysql/_rule";
import { pgNoSQLInjections } from "./rules/no-sql-injections/pg/_rule";
import { noPackageVulnerableDependencies } from "./rules/no-vulnerable-dependencies/package/_rule";
import { noUniversalVulnerableDependencies } from "./rules/no-vulnerable-dependencies/universal/_rule";
import { noBrowserXSSRule } from "./rules/no-xss/browser/_rule";
import { noEjsXSSRule } from "./rules/no-xss/ejs/_rule";
import { noReactXSSRule } from "./rules/no-xss/react/_rule";

export const rules = {
  "browser/no-xss": noBrowserXSSRule,
  "react/no-xss": noReactXSSRule,
  "ejs/no-xss": noEjsXSSRule,
  "universal/no-hc-credentials": uniNoHardcodedCredentials,
  "universal/no-vuln-deps": noUniversalVulnerableDependencies,
  "mysql/no-hardcoded-credentials": mysqlNoHardcodedCredentials,
  "mysql/no-sql-injections": mysqlNoSQLInjections,
  "pg/no-hardcoded-credentials": pgNoHardcodedCredentials,
  "pg/no-sql-injections": pgNoSQLInjections,
  "package/no-vuln-deps": noPackageVulnerableDependencies,
};

export const configs = {
  recommended: {
    extends: [
      "plugin:security-rules/browser",
      "plugin:security-rules/react",
      "plugin:security-rules/ejs",
      "plugin:security-rules/universal",
      "plugin:security-rules/mysql",
      "plugin:security-rules/pg",
      "plugin:security-rules/package",
    ],
    plugins: ["security-rules"],
  },
  browser: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/browser/no-xss": ["error"],
    },
  },
  react: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/react/no-xss": ["error"],
    },
  },
  ejs: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/ejs/no-xss": ["error"],
    },
  },
  universal: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/universal/no-hc-credentials": ["error"],
      "security-rules/universal/no-vuln-deps": ["error"],
    },
  },
  mysql: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/mysql/no-hardcoded-credentials": ["error"],
      "security-rules/mysql/no-sql-injections": ["error"],
    },
  },
  pg: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/pg/no-hardcoded-credentials": ["error"],
      "security-rules/pg/no-sql-injections": ["error"],
    },
  },
  package: {
    plugins: ["security-rules"],
    rules: {
      "security-rules/package/no-vuln-deps": ["error"],
    },
  },
};
