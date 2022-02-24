import { sanitize } from "dompurify";

export async function DangerComp(): Promise<JSX.Element> {
  const unsafeConstant = await (await fetch("evil")).text();
  const ohNo = { __html: unsafeConstant };

  return (
    <div dangerouslySetInnerHTML={ohNo}>
      <img src={sanitize(unsafeConstant, { USE_PROFILES: { html: true } })} />
      <a href={unsafeConstant} />
    </div>
  );
}
