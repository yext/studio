import { TemplateConfig, TemplateProps } from "@yext/pages";
import ComplexBanner from "../../ComponentFile/ComplexBanner";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    filter: {},
    localization: { locales: ["en"], primary: false },
    fields: ["title", "stringLiteral", "arrayIndex"],
  },
};

export default function IndexPage({ document }: TemplateProps) {
  return (
    <>
      <ComplexBanner title={document.title} />
      <ComplexBanner title={`this is ${document.stringLiteral}`} />
      <ComplexBanner title={document.arrayIndex[0]} />
      <ComplexBanner title="document.notAStreamField" />
    </>
  );
}
