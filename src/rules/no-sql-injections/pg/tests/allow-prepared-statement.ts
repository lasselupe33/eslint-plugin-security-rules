import { client as a, unsafe } from "./config-connection";

const query = {
  name: "fetch-car",
  text: "SELECT * FROM warehouse WHERE id = $1",
  values: [unsafe], // Compliant
};

a.query(query);
