import { sanitize } from "dompurify";

export function DangerComp(): JSX.Element {
  const unsafeConstant = evilCall() as string;
  const ohNo = { __html: unsafeConstant };

  return (
    <div dangerouslySetInnerHTML={ohNo}>
      <img src={sanitize(unsafeConstant, { USE_PROFILES: { html: true } })} />
      <a href={unsafeConstant} />
    </div>
  );
}
