import { TemplateConfig, TemplateProps } from "@yext/pages";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-test",
    localization: { locales: ["en"], primary: false },
    filter: {},
    fields: ["slug"],
  },
};

export default function IndexPage({ document }: TemplateProps) {
  return <></>;
}
