import { TemplateConfig, TemplateProps } from "@yext/pages";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-test",
    localization: { locales: ["en"] },
    filter: {},
    fields: ["name"],
  },
};

export default function PageWithErrorComponentState({
  document,
}: TemplateProps) {
  return <UnknownComponent title={document.name} />;
}
