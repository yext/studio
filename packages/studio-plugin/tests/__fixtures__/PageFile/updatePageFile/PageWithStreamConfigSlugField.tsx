import { TemplateConfig, TemplateProps } from "@yext/pages";
import ComplexBanner from "../../ComponentFile/ComplexBanner";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    localization: { locales: ["en"], primary: false },
    filter: {},
    fields: ["title", "slug"],
  },
};

export default function IndexPage({ document }: TemplateProps) {
  return <ComplexBanner title={document.title} />;
}
