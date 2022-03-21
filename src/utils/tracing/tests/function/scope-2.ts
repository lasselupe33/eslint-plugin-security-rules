function b() {
  return "bVal";
}

function a() {
  function b() {
    return "aVal";
  }

  return b();
}

const start = b();

export {};
