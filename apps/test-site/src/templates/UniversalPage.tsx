import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import TailwindBoi from "../components/TailwindBoi";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-UniversalPage",
    localization: { locales: ["en"], primary: false },
    filter: { entityTypes: ["location"] },
    fields: ["services", "address", "hours", "slug"],
  },
};
export const getPath: GetPath<TemplateProps> = ({
  document,
}: TemplateProps) => {
  return document.slug;
};

export default function UniversalPage({ document }: TemplateProps) {
  return (
    <>
      <TailwindBoi boi="bg-primary"/>
    </>
  );
}
