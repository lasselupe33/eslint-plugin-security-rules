import { useState, useEffect } from "react";

export function SafeComp(): JSX.Element {
  const value = useMyCustomHook();
  const safe = { __html: value };

  return <div dangerouslySetInnerHTML={safe}>Hejsa verden</div>;
}

function useMyCustomHook(): string {
  const [evil, setEvil] = useState("hello");

  useEffect(() => {
    const update = async () => {
      setEvil(await (await fetch("evil")).text());
    };

    update();
  }, []);

  return evil;
}
