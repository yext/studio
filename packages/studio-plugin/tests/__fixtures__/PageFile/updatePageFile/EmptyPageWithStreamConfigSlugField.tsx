import { TemplateConfig, TemplateProps } from "@yext/pages";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    filter: {},
    localization: { locales: ["en"], primary: false },
    fields: ["slug"],
  },
};

export default function IndexPage({ document }: TemplateProps) {
  return <></>;
}
