import { TemplateProps } from "@yext/pages";

export default function IndexPage({ document }: TemplateProps) {
  return (
    <>
      {document.services.map(() => (
        <br />
      ))}
    </>
  );
}
