type Entity = {
  name: string | null;
};

function processEntity(e?: Entity) {
  const s = e!.name; // Assert that e is non-null and access name
  return s;
}

const entity = { name: "foo" };

const start = processEntity(entity);

export {};
