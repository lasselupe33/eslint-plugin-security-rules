function myTag(strings: TemplateStringsArray, age: number) {
  const str0 = strings[0]; // "That person is a"
  const str1 = strings[2]; // "."

  let ageStr;
  if (age > 99) {
    ageStr = "old";
  } else {
    ageStr = "young";
  }

  return `${str0}${ageStr}${str1}`;
}

const age = 43;
const output = myTag`That person is a${age}.`;

const start = output;

export {};
