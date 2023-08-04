import { TemplateConfig, TemplateProps } from "@yext/pages";
import ComplexBanner from "../../ComponentFile/ComplexBanner";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-test",
    localization: { locales: ["en"], primary: false },
    filter: {},
    fields: [
      "title",
      "exp",
      "color",
      "services",
      "stringLiteral",
      "arrayIndex",
    ],
  },
};

export default function IndexPage({ document }: TemplateProps) {
  return (
    <>
      <ComplexBanner
        title={document.title}
        cta={{ link: document.exp, linkType: "linktype", label: "label" }}
        colorArr={[document.color]}
      />
      {document.services.map((item, index) => (
        <ComplexBanner
          title={`this is ${document.stringLiteral}`}
          key={index}
        />
      ))}
      <ComplexBanner title={document.arrayIndex[0]} />
      <ComplexBanner title="document.notAStreamField" />
    </>
  );
}
