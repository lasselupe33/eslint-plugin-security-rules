async function testCase() {
  const imported = await import("./exports/export-simple");

  const start = imported.a;
}

export {};
