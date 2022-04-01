import { useEffect, useState } from "react";

function myComp() {
  const [myState, setState] = useState("initVal");

  useEffect(() => {
    setState("aVal");
  }, []);

  const start = myState;
}
