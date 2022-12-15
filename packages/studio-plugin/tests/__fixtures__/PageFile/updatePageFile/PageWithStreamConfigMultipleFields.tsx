import { TemplateConfig, TemplateProps } from "@yext/pages";
import SimpleBanner from "../../ComponentFile/SimpleBanner";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id_mock-uuid-value",
    filter: {},
    localization: { locales: ["en"], primary: false },
    fields: ["title", "stringLiteral", "arrayIndex"],
  },
};

export default function IndexPage({ document }: TemplateProps) {
  return (
    <>
      <SimpleBanner title={document.title} />
      <SimpleBanner title={`this is ${document.stringLiteral}`} />
      <SimpleBanner title={document.arrayIndex[0]} />
      <SimpleBanner title="document.notAStreamField" />
    </>
  );
}
