import "./index.css";
import ComplexBanner from "../ComponentFile/ComplexBanner";
import "@yext/search-ui-react/index.css";
import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    localization: { locales: ["en"], primary: false },
    filter: { entityTypes: ["location"] },
    fields: ["title", "slug"],
  },
};

export const getPath: GetPath<TemplateProps> = ({
  document,
}: TemplateProps) => {
  return document.slug;
};

export default function Location({ document }: TemplateProps) {
  return <ComplexBanner title={document.title} num={3} bool={false} />;
}
