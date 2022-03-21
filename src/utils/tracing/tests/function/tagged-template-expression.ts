function myTag(strings: TemplateStringsArray, ...expressions: unknown[]) {
  return `${strings[0]}-${expressions[0]}-tagged`;
}

const start = myTag`hello-${2}`;

export {};
