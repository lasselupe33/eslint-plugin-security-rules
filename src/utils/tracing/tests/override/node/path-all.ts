import path from "path";

const start = path.join(
  path.dirname(__filename),
  path.parse("somePath").name,
  path.normalize(__dirname),
  path.extname(__filename),
  path.delimiter,
  path.sep
);
