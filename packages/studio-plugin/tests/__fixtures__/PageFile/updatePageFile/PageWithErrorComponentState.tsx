import { TemplateConfig, TemplateProps } from "@yext/pages";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-test",
    localization: { locales: ["en"], primary: false },
    filter: {},
    fields: ["name"],
  },
};

export default function PageWithErrorComponentState({
  document,
}: TemplateProps) {
  return <Banner title={document.name} />;
}
