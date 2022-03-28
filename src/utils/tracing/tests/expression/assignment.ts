function getPie(doYouLikeApple: boolean) {
  if (doYouLikeApple) {
    return "Apple";
  } else {
    return "Potato";
  }
}

const random = Math.random();

let pie = getPie(random > 0.9);
pie += " Pie";

const start = pie;

export {};
