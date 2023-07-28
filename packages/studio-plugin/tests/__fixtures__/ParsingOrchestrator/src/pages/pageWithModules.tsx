import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import NestedBanner from "../components/NestedBanner";
import NestedModule from "../modules/a/b/NestedModule";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    localization: { locales: ["en"], primary: false },
    filter: {},
    fields: ["slug"],
  },
};

export const getPath: GetPath<TemplateProps> = ({
  document,
}: TemplateProps) => {
  return document.slug;
};

export default function IndexPage() {
  return (
    <NestedBanner text="nestedBanner">
      <NestedModule />
    </NestedBanner>
  );
}
