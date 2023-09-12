import { TemplateProps } from "@yext/pages";

export default function Test({ document }: TemplateProps) {
  return (
    <>
      {document.services.map(() => (
        <br />
      ))}
    </>
  );
}
