import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import ComplexBanner from "../../ComponentFile/ComplexBanner";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-test",
    localization: { locales: ["en"], primary: false },
    filter: {},
    fields: ["slug"],
  },
};
export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return document.slug;
};

export default function IndexPage() {
  return <ComplexBanner title="title" />;
}
