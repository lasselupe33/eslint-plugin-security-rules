export function DangerComp(): JSX.Element {
  const safeConstant = "hello-world";
  const ohNo = { __html: safeConstant };

  return (
    <div dangerouslySetInnerHTML={ohNo}>
      <img src={safeConstant} />
      <a href={safeConstant} />
    </div>
  );
}
