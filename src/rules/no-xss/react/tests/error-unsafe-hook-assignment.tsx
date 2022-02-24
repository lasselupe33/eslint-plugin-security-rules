import { useState, useEffect } from "react";

export function SafeComp(): JSX.Element {
  const value = useMyCustomHook();
  const safe = { __html: value };

  return <div dangerouslySetInnerHTML={safe}>Hejsa verden</div>;
}

function useMyCustomHook(): string {
  const [evil, setEvil] = useState("hello");

  useEffect(() => {
    setEvil(evil() as string);
  }, []);

  return evil;
}
