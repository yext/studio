import { TemplateConfig, TemplateProps } from "@yext/pages";
import ComplexBanner from "../../ComponentFile/ComplexBanner";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-test",
    localization: { locales: ["en"] },
    filter: {},
    fields: ["arrayIndex", "objectField.attr1", "objectField.attr2"],
  },
};

export default function IndexPage({ document }: TemplateProps) {
  return (
    <>
      <ComplexBanner title={document.arrayIndex[0]} />
      <ComplexBanner title={document.arrayIndex[1]} />
      <ComplexBanner title={document.objectField.attr1} />
      <ComplexBanner title={document.objectField.attr2} />
    </>
  );
}
