import { TemplateConfig, TemplateProps } from "@yext/pages";
import ComplexBanner from "../../ComponentFile/ComplexBanner";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-test",
    localization: { locales: ["en"] },
    filter: { entityTypes: ["location"] },
    fields: ["title"],
  },
};

export default function IndexPage({ document }: TemplateProps) {
  return <ComplexBanner title={document.title} />;
}
