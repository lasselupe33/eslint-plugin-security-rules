// Currently unhandled due to the way the tracer handles arrays. If we start
// tracing each object in an array, it may lead to big runtimes.

const clientConfig = [
  {
    user: "root",
    host: "database.com",
    database: "database",
    password: "secretpassword",
    port: 3211,
  },
];

// To bypass no unused variable rules
clientConfig.toString();

export {};
