import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import ComplexBanner from "../../ComponentFile/ComplexBanner";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-test",
    localization: { locales: ["en"] },
    filter: {},
    fields: ["title", "city", "services"],
  },
};
export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return `${document.city}-${document.services[0]}`;
};

export default function IndexPage({ document }: TemplateProps) {
  return <ComplexBanner title={document.title} />;
}
